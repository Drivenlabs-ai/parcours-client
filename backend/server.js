import { createApp } from "./app.js";
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = Number(
  portIndex >= 0 ? args[portIndex + 1] : process.env.PORT || 3000,
);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("Port invalide. Exemple : npm start -- --port 3001");
  process.exit(1);
}
const server = createApp();
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Le port ${port} est déjà utilisé. Arrêtez l’autre serveur ou lancez : npm start -- --port 3001`
      : error.message,
  );
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Portail support : http://localhost:${port}`),
);
