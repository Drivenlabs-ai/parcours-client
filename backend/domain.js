import { randomUUID } from "node:crypto";

export const statuses = ["ouvert", "en_cours", "resolu"];

export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function text(value, label, min, max) {
  if (typeof value !== "string")
    throw new AppError(`${label} est obligatoire.`);
  const clean = value.trim();
  if ([...clean].length < min || [...clean].length > max)
    throw new AppError(
      `${label} doit contenir entre ${min} et ${max} caractères.`,
    );
  return clean;
}

export function createTicket(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new AppError("Demande invalide.");
  const subject = text(input.subject, "Le sujet", 3, 100);
  const description = text(input.description, "La description", 10, 2000);
  return {
    id: randomUUID(),
    subject,
    description,
    status: "ouvert",
    createdAt: new Date().toISOString(),
    messages: [],
  };
}

export function addMessage(ticket, input) {
  const body = text(input?.text, "La réponse", 1, 2000);
  const message = {
    id: randomUUID(),
    author: "Support",
    text: body,
    createdAt: new Date().toISOString(),
  };
  return { ...ticket, messages: [...ticket.messages, message] };
}

export function changeStatus(ticket, status) {
  if (!statuses.includes(status)) throw new AppError("Statut inconnu.");
  if (status === "resolu" && ticket.messages.length === 0)
    throw new AppError(
      "Ajoutez une réponse avant de résoudre cette demande.",
      422,
    );
  return { ...ticket, status };
}
