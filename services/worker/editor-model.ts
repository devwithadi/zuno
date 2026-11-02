import { ChatOpenAI } from '@langchain/openai';
import { ChatBedrockConverse } from '@langchain/aws';
import { z } from 'zod';

type Environment = Record<string, string | undefined>;
const bedrockConfig = z.object({
  region: z.string().regex(/^[a-z]{2}(?:-[a-z]+)+-\d$/),
  model: z.string().min(1).max(200).regex(/^[a-zA-Z0-9][a-zA-Z0-9.:-]*$/),
});
export function createEditorialModel(env: Environment) {
  const provider = env.EDITOR_PROVIDER ?? 'local';
  if (provider === 'bedrock') {
    const { region, model } = bedrockConfig.parse({ region: env.BEDROCK_REGION,
      model: env.BEDROCK_MODEL_ID ?? env.BEDROCK_CLIENT_ANSWER_MODEL_ID });
    const token = (env.AWS_BEARER_TOKEN_BEDROCK || env.BEDROCK_API_KEY)?.trim();
    if (!token) throw Error('Bedrock bearer credential required');
    return new ChatBedrockConverse({ model, region, bedrockBearerToken: token,
      endpointHost: `bedrock-runtime.${region}.amazonaws.com`,
      temperature: 0, maxTokens: 2400, maxRetries: 0,
      clientOptions: { maxAttempts: 1,
        requestHandler: { requestTimeout: 20_000, connectionTimeout: 5_000 } },
    });
  }
  if (provider !== 'local') throw Error('Set EDITOR_PROVIDER to local or bedrock');
  if (!env.LOCAL_MODEL_URL || !env.LOCAL_MODEL_NAME) throw Error('Local model configuration required');
  const endpoint = new URL(env.LOCAL_MODEL_URL);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname) ||
      !['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) {
    throw Error('Editorial model must run on localhost');
  }
  return new ChatOpenAI({ model: env.LOCAL_MODEL_NAME, apiKey: 'local-only',
    configuration: { baseURL: endpoint.toString() }, temperature: 0, maxTokens: 2400,
    timeout: 20_000, maxRetries: 0 });
}
