import { isBuiltin } from 'node:module';
import path from 'node:path';
import ts from 'typescript';

const layers = ['apps/mobile', 'packages/shared', 'packages/storage',
  'services/api', 'services/worker'] as const;
type Layer = typeof layers[number];
const allowed: Record<Layer, readonly Layer[]> = {
  'apps/mobile': ['apps/mobile', 'packages/shared'],
  'packages/shared': ['packages/shared'],
  'packages/storage': ['packages/storage', 'packages/shared'],
  'services/api': ['services/api', 'packages/shared', 'packages/storage'],
  'services/worker': ['services/worker', 'packages/shared', 'packages/storage'],
};
const options: ts.CompilerOptions = { moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext, resolveJsonModule: true };
const serverPackages = /^(mongodb|hono|dotenv|@clerk\/backend|@hono\/node-server|@langchain\/[^/]+)(\/|$)/;

function layerOf(filename: string, root: string): Layer | undefined {
  const relative = path.relative(root, filename).split(path.sep).join('/');
  return layers.find((layer) => relative.startsWith(`${layer}/`));
}

function imports(source: ts.SourceFile): string[] {
  const visit = (node: ts.Node): string[] => {
    let specifier: ts.Node | undefined;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = node.moduleSpecifier;
    if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      specifier = node.moduleReference.expression;
    }
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      specifier = node.argument.literal;
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
      specifier = node.arguments[0];
    }
    const own = specifier && ts.isStringLiteralLike(specifier) ? [specifier.text] : [];
    const children: string[][] = [];
    ts.forEachChild(node, (child) => { children.push(visit(child)); });
    return [...own, ...children.flat()];
  };
  return visit(source);
}

export function checkDependencies(filename: string, code: string, root: string): string[] {
  const layer = layerOf(filename, root);
  if (!layer) return [];
  const source = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);
  return imports(source).flatMap((name) => {
    const failure = `${path.relative(root, filename)}: forbidden or unresolved dependency ${name}`;
    if ((layer === 'packages/shared' || layer === 'apps/mobile') &&
        (isBuiltin(name) || serverPackages.test(name))) return [failure];
    const resolved = ts.resolveModuleName(name, filename, options, ts.sys).resolvedModule;
    if (!resolved) {
      return name.startsWith('.') || path.isAbsolute(name) || name.startsWith('@zuno/') ? [failure] : [];
    }
    const target = resolved.resolvedFileName;
    if (target.split(path.sep).includes('node_modules') && !name.startsWith('@zuno/')) return [];
    const targetLayer = layerOf(target, root);
    return targetLayer && allowed[layer].includes(targetLayer) ? [] : [failure];
  });
}

export function projectViolations(root: string): string[] {
  return layers.flatMap((layer) => ts.sys.readDirectory(path.join(root, layer),
    ['.ts', '.tsx', '.mts', '.cts'], ['**/node_modules/**', '**/dist/**', '**/.expo/**']))
    .flatMap((filename) => checkDependencies(filename, ts.sys.readFile(filename) ?? '', root));
}
