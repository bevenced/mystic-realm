import OpenAI from "openai";

let client: OpenAI | null = null;

export function getDeepSeek(): OpenAI | null {
  if (!process.env.DEEPSEEK_API_KEY) return null;
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });
  }
  return client;
}
