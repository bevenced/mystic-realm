#!/usr/bin/env node

/**
 * Vision MCP Server for Claude Code — multi-provider edition
 * Zero dependencies. Supports DashScope Qwen-VL, OpenAI GPT-4o-mini, and Groq Llama-4 Scout.
 *
 * Auto-selects backend based on which API key is set (DashScope preferred).
 *
 * Usage in .mcp.json:
 *   {
 *     "mcpServers": {
 *       "vision": {
 *         "type": "stdio",
 *         "command": "node",
 *         "args": ["scripts/vision-mcp-server.js"],
 *         "env": {
 *           "DASHSCOPE_API_KEY": "sk-...",
 *           "OPENAI_API_KEY": "sk-...",
 *           "GROQ_API_KEY": "gsk_..."
 *         }
 *       }
 *     }
 *   }
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// ---- Config ----
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || "";

// Pick backend: DashScope (reachable) > OpenAI (blocked) > Groq (expired)
const BACKEND = DASHSCOPE_API_KEY ? "dashscope" : OPENAI_API_KEY ? "openai" : GROQ_API_KEY ? "groq" : null;

const PROVIDERS = {
  dashscope: { host: "dashscope.aliyuncs.com", path: "/compatible-mode/v1/chat/completions", key: DASHSCOPE_API_KEY, model: "qwen-vl-plus" },
  openai:    { host: "api.openai.com",           path: "/v1/chat/completions",                key: OPENAI_API_KEY,      model: "gpt-4o-mini" },
  groq:      { host: "api.groq.com",             path: "/openai/v1/chat/completions",         key: GROQ_API_KEY,        model: "meta-llama/llama-4-scout-17b-16e-instruct" },
};

// ---- JSON-RPC Helpers ----
let nextId = 0;

function send(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

function sendError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n");
}

function log(msg) {
  process.stderr.write(`[vision-mcp] ${msg}\n`);
}

// ---- Image to Base64 ----
function imageToBase64(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) throw new Error(`File not found: ${abs}`);
  const buf = fs.readFileSync(abs);
  const ext = path.extname(abs).slice(1).toLowerCase();
  const mimeMap = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", bmp: "image/bmp" };
  const mime = mimeMap[ext] || "image/png";
  return { base64: buf.toString("base64"), mime };
}

// ---- Call Vision API (provider-agnostic) ----
function callVisionAPI(prompt, base64, mime) {
  const provider = PROVIDERS[BACKEND];
  if (!provider) throw new Error("No API key configured. Set DASHSCOPE_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY in .mcp.json env.");

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: provider.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.2,
    });

    const req = https.request(
      {
        hostname: provider.host,
        path: provider.path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
        },
        timeout: 60000,
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const j = JSON.parse(data);
            if (j.error) {
              const msg = j.error.message || "Unknown API error";
              log(`API error (${res.statusCode}): ${msg}`);
              return reject(new Error(`[${BACKEND}] ${msg}`));
            }
            resolve(j.choices?.[0]?.message?.content || "(no response)");
          } catch (e) {
            reject(new Error(`Parse error: ${data.slice(0, 200)}`));
          }
        });
      },
    );

    req.on("error", (e) => reject(new Error(`Network error: ${e.message}`)));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out after 60s"));
    });
    req.write(body);
    req.end();
  });
}

// ---- Tool Definitions ----
const TOOLS = [
  {
    name: "analyze_image",
    description: "Analyze an image file and return a detailed text description. Use this to understand screenshots, photos, UI designs, diagrams, or any visual content.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: { type: "string", description: "Absolute or relative path to the image file (PNG, JPG, GIF, WebP, BMP)" },
        question: { type: "string", description: "Optional: specific question about what to look for in the image" },
      },
      required: ["file_path"],
    },
  },
  {
    name: "extract_code_from_image",
    description: "Extract code or text visible in a screenshot or photo. Use for screenshots of code, error messages, or any text-heavy image.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: { type: "string", description: "Path to the image file" },
      },
      required: ["file_path"],
    },
  },
];

// ---- Request Handler ----
async function handleRequest(msg) {
  const { id, method, params } = msg;

  switch (method) {
    case "initialize":
      return {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "vision-mcp", version: "2.0.0" },
      };

    case "tools/list":
      return { tools: TOOLS };

    case "tools/call": {
      const { name, arguments: args } = params || {};
      const filePath = args?.file_path;

      if (!BACKEND) {
        throw new Error("No API key configured. Set DASHSCOPE_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY in .mcp.json env.");
      }

      if (!filePath) {
        throw new Error("file_path is required");
      }

      const { base64, mime } = imageToBase64(filePath);
      log(`[${BACKEND}] Analyzing: ${filePath} (${mime}, ${(base64.length / 1024).toFixed(1)}KB)`);

      let prompt;
      if (name === "extract_code_from_image") {
        prompt = "Extract ALL text/code visible in this image. Return the exact text verbatim, preserving formatting and line breaks. Do not add commentary.";
      } else {
        prompt = args?.question
          ? `Answer this question about the image: ${args.question}\n\nBe specific and detailed. Describe what you see.`
          : "Describe this image in detail. What do you see? Include all relevant text, UI elements, colors, layout, and context. Be thorough and specific.";
      }

      const description = await callVisionAPI(prompt, base64, mime);
      log(`Done: ${description.slice(0, 100)}...`);

      return {
        content: [{ type: "text", text: description }],
      };
    }

    default:
      log(`Unknown method: ${method}`);
      return {};
  }
}

// ---- Main ----
function main() {
  let buffer = "";

  log(`Backend: ${BACKEND || "NONE (no API key set!)"}`);

  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        const id = msg.id;

        handleRequest(msg)
          .then((result) => {
            if (id !== undefined && id !== null) send(id, result);
          })
          .catch((err) => {
            log(`Error: ${err.message}`);
            if (id !== undefined && id !== null) sendError(id, -32000, err.message);
          });
      } catch {
        log(`Invalid JSON: ${line.slice(0, 100)}`);
      }
    }
  });

  process.stdin.on("end", () => { log("stdin closed, exiting"); process.exit(0); });
  process.on("SIGTERM", () => process.exit(0));

  log("Vision MCP server ready");
}

main();
