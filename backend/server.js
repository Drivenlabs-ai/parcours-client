import { createApp } from "./app.js";
const port = Number(process.env.PORT || 3000);
const server = createApp();
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Le port ${port} est déjà utilisé. Définissez PORT pour en choisir un autre.`
      : error.message,
  );
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Portail support : http://localhost:${port}`),
);
