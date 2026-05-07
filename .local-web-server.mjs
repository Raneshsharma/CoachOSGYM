import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "apps", "web", "dist");
const port = Number(process.env.PORT ?? 5173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] ?? "application/octet-stream"
    });
    res.end(data);
  });
}

function proxyApi(req, res) {
  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: 4000,
      path: req.url,
      method: req.method,
      headers: req.headers
    },
    (apiRes) => {
      res.writeHead(apiRes.statusCode ?? 502, apiRes.headers);
      apiRes.pipe(res);
    }
  );

  upstream.on("error", () => {
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ message: "Local API is not running." }));
  });

  req.pipe(upstream);
}

http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);

  if (url.pathname.startsWith("/api/")) {
    proxyApi(req, res);
    return;
  }

  const requested = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(dist, requested === "/" ? "index.html" : requested);
  const resolved = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    ? filePath
    : path.join(dist, "index.html");

  sendFile(res, resolved);
}).listen(port, "127.0.0.1", () => {
  console.log(`CoachOS web running on http://127.0.0.1:${port}`);
});
