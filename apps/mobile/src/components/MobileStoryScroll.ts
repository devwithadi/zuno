export type ScrollMetrics = { offset: number; viewport: number; content: number };
export type ScrollBoundary = { top: boolean; bottom: boolean };

export function storyScrollBoundary({ offset, viewport, content }: ScrollMetrics): ScrollBoundary {
  const fits = !viewport || !content || content <= viewport + 2;
  return {
    top: fits || offset <= 2,
    bottom: fits || offset + viewport >= content - 2,
  };
}
