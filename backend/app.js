import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { AppError, statuses } from "./domain.js";
import { createStore } from "./store.js";

const staticFiles = new Map([
  [
    "/frontend/brand/imagine-human.png",
    ["brand/imagine-human.png", "image/png"],
  ],
  ["/frontend/brand/work-sans.woff2", ["brand/work-sans.woff2", "font/woff2"]],
  ["/", ["index.html", "text/html"]],
  ["/frontend/app.js", ["app.js", "text/javascript"]],
  ["/frontend/api.js", ["api.js", "text/javascript"]],
  ["/frontend/style.css", ["style.css", "text/css"]],
]);

async function readJson(request) {
  if (
    request.headers["content-type"]?.split(";")[0].trim() !== "application/json"
  )
    throw new AppError("Le corps doit être au format JSON.", 415);
  let body = "";
  request.setEncoding("utf8");
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > 16384)
      throw new AppError("Demande trop volumineuse.", 413);
  }
  try {
    return JSON.parse(body);
  } catch {
    throw new AppError("JSON invalide.");
  }
}

export function createApp(store = createStore()) {
  return createServer(async (request, response) => {
    const json = (status, body) => {
      response.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(JSON.stringify(body));
    };
    try {
      const host = request.headers.host;
      if (!/^(localhost|127\.0\.0\.1):\d+$/.test(host || ""))
        throw new AppError("Hôte non autorisé.", 403);
      if (request.headers.origin && request.headers.origin !== `http://${host}`)
        throw new AppError("Origine non autorisée.", 403);
      const url = new URL(request.url, `http://${host}`);
      const path = url.pathname;
      if (path === "/api/tickets" && request.method === "GET") {
        const query = (url.searchParams.get("q") || "")
          .trim()
          .toLocaleLowerCase("fr");
        const status = url.searchParams.get("status");
        if (status && !statuses.includes(status))
          throw new AppError("Filtre de statut inconnu.");
        const tickets = store.all();
        const visible = tickets.filter(
          (ticket) =>
            (!status || ticket.status === status) &&
            `${ticket.subject} ${ticket.description}`
              .toLocaleLowerCase("fr")
              .includes(query),
        );
        const counts = Object.fromEntries(
          statuses.map((value) => [
            value,
            tickets.filter((ticket) => ticket.status === value).length,
          ]),
        );
        return json(200, { tickets: visible, counts });
      }
      if (path === "/api/tickets" && request.method === "POST")
        return json(201, { ticket: store.create(await readJson(request)) });
      if (path === "/api/reset" && request.method === "POST") {
        await readJson(request);
        store.reset();
        return json(200, { ok: true });
      }
      const match = path.match(/^\/api\/tickets\/([^/]+)(\/messages)?$/);
      if (match) {
        const id = match[1];
        if (request.method === "GET" && !match[2])
          return json(200, { ticket: store.get(id) });
        if (request.method === "PATCH" && !match[2])
          return json(200, {
            ticket: store.setStatus(id, (await readJson(request))?.status),
          });
        if (request.method === "POST" && match[2])
          return json(201, {
            ticket: store.reply(id, await readJson(request)),
          });
      }
      if (path.startsWith("/api/"))
        throw new AppError("Route inconnue ou méthode non disponible.", 404);
      if (!["GET", "HEAD"].includes(request.method)) {
        response.writeHead(405, { Allow: "GET, HEAD" }).end();
        return;
      }
      const file = staticFiles.get(path);
      if (!file) throw new AppError("Page introuvable.", 404);
      const body = await readFile(
        new URL(`../frontend/${file[0]}`, import.meta.url),
      );
      response.writeHead(200, {
        "Content-Type": file[1].startsWith("text/")
          ? `${file[1]}; charset=utf-8`
          : file[1],
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (error) {
      if (!(error instanceof AppError)) console.error(error);
      json(error instanceof AppError ? error.status : 500, {
        error:
          error instanceof AppError
            ? error.message
            : "Erreur du serveur. Réessayez dans un instant.",
      });
    }
  });
}
