import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
} from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AppError, createTicket, addMessage, changeStatus } from "./domain.js";

export function createStore(
  file = fileURLToPath(new URL("../data/tickets.local.json", import.meta.url)),
) {
  const seed = JSON.parse(
    readFileSync(new URL("../data/tickets.seed.json", import.meta.url), "utf8"),
  );
  function write(tickets) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(
      `${file}.tmp`,
      JSON.stringify(tickets, null, 2) + "\n",
      "utf8",
    );
    renameSync(`${file}.tmp`, file);
    return tickets;
  }
  if (!existsSync(file)) write(seed);
  // Opérations synchrones courtes : chaque modification relit le dernier état
  // et l'enregistre avant que le processus ne traite la suivante.
  function all() {
    return JSON.parse(readFileSync(file, "utf8"));
  }
  function get(id) {
    const ticket = all().find((item) => item.id === id);
    if (!ticket) throw new AppError("Demande introuvable.", 404);
    return ticket;
  }
  function update(id, transform) {
    const tickets = all();
    const index = tickets.findIndex((item) => item.id === id);
    if (index === -1) throw new AppError("Demande introuvable.", 404);
    tickets[index] = transform(tickets[index]);
    write(tickets);
    return tickets[index];
  }
  return {
    all,
    get,
    create(input) {
      const ticket = createTicket(input);
      write([ticket, ...all()]);
      return ticket;
    },
    reply(id, input) {
      return update(id, (ticket) => addMessage(ticket, input));
    },
    setStatus(id, status) {
      return update(id, (ticket) => changeStatus(ticket, status));
    },
    reset() {
      return write(structuredClone(seed));
    },
  };
}
