import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/src/app.js', ['src/app.js', 'text/javascript']],
  ['/src/parcours.js', ['src/parcours.js', 'text/javascript']],
  ['/src/style.css', ['src/style.css', 'text/css']],
]);
const port = Number(process.env.PORT || 3000);
const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const entry = files.get(new URL(request.url, 'http://localhost').pathname);
  if (!entry) { response.writeHead(404).end('Page introuvable'); return; }
  try {
    const body = await readFile(new URL(entry[0], import.meta.url));
    response.writeHead(200, { 'Content-Type': `${entry[1]}; charset=utf-8`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500).end('Impossible de lire le fichier.');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Le port ${port} est déjà utilisé. Fermez l'application qui l'utilise ou définissez PORT.` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Parcours client : http://localhost:${port}`));
