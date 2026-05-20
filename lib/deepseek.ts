import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.DEEPSEEK_API_KEY) return null;
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });
  }
  return client;
}

/**
 * Non-streaming completion (existing pattern for fortune readings, etc.).
 */
export function getDeepSeek(): OpenAI | null {
  return getClient();
}

/**
 * Stream a chat completion via DeepSeek. Yields content tokens as they arrive.
 * @returns An async generator yielding each content delta string.
 */
export async function* streamDeepSeek(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
): AsyncGenerator<string> {
  const ai = getClient();
  if (!ai) throw new Error("DeepSeek API key not configured");

  const stream = await ai.chat.completions.create({
    model: "deepseek-chat",
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) yield delta;
  }
}
