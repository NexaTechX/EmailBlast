/**
 * Local /api server for Vite proxy (port 3000).
 * Prefer this over `vercel dev` — Vercel's ESM loader fails on extensionless
 * relative imports under `"type": "module"`.
 *
 * Usage: npm run dev:api
 */
import http from "node:http";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const port = Number(process.env.API_PORT || 3000);

type VercelRes = {
  statusCode: number;
  headers: Record<string, string | number | string[]>;
  status: (code: number) => VercelRes;
  setHeader: (k: string, v: string | number | string[]) => void;
  json: (body: unknown) => void;
  send: (body: string | Buffer) => void;
  end: (body?: string | Buffer) => void;
};

function createRes(res: http.ServerResponse): VercelRes {
  const wrapper: VercelRes = {
    statusCode: 200,
    headers: {},
    status(code: number) {
      wrapper.statusCode = code;
      return wrapper;
    },
    setHeader(k, v) {
      wrapper.headers[k.toLowerCase()] = v;
    },
    json(body) {
      const payload = JSON.stringify(body);
      wrapper.setHeader("content-type", "application/json; charset=utf-8");
      wrapper.end(payload);
    },
    send(body) {
      wrapper.end(body);
    },
    end(body) {
      if (res.writableEnded) return;
      res.statusCode = wrapper.statusCode;
      for (const [k, v] of Object.entries(wrapper.headers)) {
        res.setHeader(k, v);
      }
      res.end(body);
    },
  };
  return wrapper;
}

async function readBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  const ct = String(req.headers["content-type"] || "");
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

function resolveApiModule(urlPath: string): string | null {
  const cleaned = urlPath.split("?")[0].replace(/\/+$/, "");
  if (!cleaned.startsWith("/api/")) return null;
  const rel = cleaned.slice(1);
  return path.join(root, `${rel}.ts`);
}

const server = http.createServer(async (req, res) => {
  const url = req.url || "/";
  const file = resolveApiModule(url);
  if (!file) {
    res.statusCode = 404;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  try {
    const mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
    const handler = mod.default;
    if (typeof handler !== "function") {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Invalid API handler" }));
      return;
    }

    const body = ["POST", "PUT", "PATCH"].includes(req.method || "")
      ? await readBody(req)
      : undefined;

    const vercelReq = Object.assign(req, {
      query: Object.fromEntries(new URL(url, "http://localhost").searchParams),
      body,
      cookies: {},
    });
    const vercelRes = createRes(res);
    await handler(vercelReq, vercelRes);
    if (!res.writableEnded) vercelRes.end();
  } catch (err) {
    console.error("API error", url, err);
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          error: err instanceof Error ? err.message : "Internal server error",
        }),
      );
    }
  }
});

server.listen(port, () => {
  console.log(`Local API listening on http://localhost:${port}`);
});
