/**
 * SSE (Server-Sent Events) serialization utilities.
 */

export function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function sseData(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}
