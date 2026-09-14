import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { createStore } from "../backend/store.js";
import { createApp } from "../backend/app.js";

async function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), "support-test-"));
  const file = join(dir, "tickets.json");
  const app = createApp(createStore(file));
  app.listen(0, "127.0.0.1");
  await once(app, "listening");
  t.after(async () => {
    await new Promise((resolve) => app.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  });
  const origin = `http://127.0.0.1:${app.address().port}`;
  async function request(path, method = "GET", body, headers = {}) {
    const response = await fetch(origin + path, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }
  return { request, file, origin };
}

test("créer, répondre et résoudre une demande ; persistance dans le fichier", async (t) => {
  const { request, file } = await fixture(t);
  const created = await request("/api/tickets", "POST", {
    subject: "  Un nouvel export  ",
    description: "Nous souhaitons exporter les données.",
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.ticket.subject, "Un nouvel export");
  assert.equal(created.body.ticket.status, "ouvert");
  const id = created.body.ticket.id;
  assert.equal(
    (await request(`/api/tickets/${id}`, "PATCH", { status: "resolu" })).status,
    422,
  );
  assert.equal(
    (
      await request(`/api/tickets/${id}/messages`, "POST", {
        text: "Voici la procédure à suivre.",
      })
    ).status,
    201,
  );
  const resolved = await request(`/api/tickets/${id}`, "PATCH", {
    status: "resolu",
  });
  assert.equal(resolved.status, 200);
  assert.equal(resolved.body.ticket.messages.length, 1);
  assert.equal(createStore(file).get(id).status, "resolu");
});

test("rejeter les entrées invalides sans ajouter de ticket", async (t) => {
  const { request } = await fixture(t);
  for (const body of [
    null,
    [],
    { subject: "  ", description: "Une description correcte." },
    { subject: "Valide", description: "Court" },
    { subject: "Valide", description: "x".repeat(2001) },
  ]) {
    assert.equal((await request("/api/tickets", "POST", body)).status, 400);
  }
  assert.equal((await request("/api/tickets")).body.tickets.length, 3);
  assert.equal(
    (await request("/api/tickets/export-csv/messages", "POST", { text: "  " }))
      .status,
    400,
  );
  assert.equal(
    (await request("/api/tickets/export-csv", "PATCH", { status: "inconnu" }))
      .status,
    400,
  );
});

test("rechercher et filtrer sans modifier les compteurs globaux", async (t) => {
  const { request } = await fixture(t);
  const result = await request("/api/tickets?q=CSV&status=ouvert");
  assert.deepEqual(
    result.body.tickets.map((ticket) => ticket.id),
    ["export-csv"],
  );
  assert.deepEqual(result.body.counts, { ouvert: 1, en_cours: 1, resolu: 1 });
  assert.equal(
    (await request("/api/tickets?q=inexistant")).body.tickets.length,
    0,
  );
  assert.equal((await request("/api/tickets?status=inconnu")).status, 400);
});

test("réinitialiser les seules données de démonstration", async (t) => {
  const { request } = await fixture(t);
  await request("/api/tickets", "POST", {
    subject: "Une demande",
    description: "Une description suffisamment longue.",
  });
  assert.equal((await request("/api/tickets")).body.tickets.length, 4);
  assert.equal((await request("/api/reset", "POST", {})).status, 200);
  assert.equal((await request("/api/tickets")).body.tickets.length, 3);
});

test("un refus de résolution préserve exactement les données ; les autres changements gardent les réponses", async (t) => {
  const { request, file } = await fixture(t);
  const before = readFileSync(file, "utf8");
  const rejected = await request("/api/tickets/export-csv", "PATCH", {
    status: "resolu",
  });
  assert.equal(rejected.status, 422);
  assert.match(rejected.body.error, /réponse/);
  assert.equal(readFileSync(file, "utf8"), before);
  const original = (await request("/api/tickets/acces-collegue")).body.ticket;
  const updated = (
    await request("/api/tickets/acces-collegue", "PATCH", { status: "resolu" })
  ).body.ticket;
  assert.deepEqual(updated, { ...original, status: "resolu" });
  assert.deepEqual(createStore(file).get(updated.id), updated);
});

test("un corps trop volumineux est refusé sans écriture", async (t) => {
  const { request, file } = await fixture(t);
  const before = readFileSync(file, "utf8");
  assert.equal(
    (
      await request("/api/tickets", "POST", {
        subject: "Long",
        description: "x".repeat(17000),
      })
    ).status,
    413,
  );
  assert.equal(readFileSync(file, "utf8"), before);
});

test("plusieurs créations conservent toutes les demandes", async (t) => {
  const { request } = await fixture(t);
  await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      request("/api/tickets", "POST", {
        subject: `Demande ${i}`,
        description: "Une description suffisamment longue.",
      }),
    ),
  );
  assert.equal((await request("/api/tickets")).body.tickets.length, 11);
});

test("les fichiers de données et les requêtes venant d’un autre site sont refusés", async (t) => {
  const { request, origin } = await fixture(t);
  assert.equal((await request("/data/tickets.local.json")).status, 404);
  assert.equal((await request("/CLAUDE.md")).status, 404);
  assert.equal(
    (await request("/api/reset", "POST", {}, { Origin: "https://example.com" }))
      .status,
    403,
  );
  assert.equal((await request("/api/tickets/manquant")).status, 404);
  const malformed = await fetch(origin + "/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(malformed.status, 400);
  const wrongType = await fetch(origin + "/api/reset", {
    method: "POST",
    body: "{}",
  });
  assert.equal(wrongType.status, 415);
  assert.equal((await fetch(origin + "/")).status, 200);
  assert.equal((await fetch(origin + "/frontend/app.js")).status, 200);
});
