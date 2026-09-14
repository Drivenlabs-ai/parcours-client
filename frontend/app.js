import { api } from "./api.js";

const labels = { ouvert: "Ouverte", en_cours: "En cours", resolu: "Résolue" };
const $ = (selector) => document.querySelector(selector);
let tickets = [],
  selectedId = null,
  loadingVersion = 0,
  busy = false;
const replyDrafts = new Map();
const date = (value) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function showError(error) {
  $("#error").textContent = error.message;
  $("#error").hidden = false;
}
function badge(ticket) {
  return el("span", `badge ${ticket.status}`, labels[ticket.status]);
}

function renderList() {
  $("#tickets").replaceChildren();
  $("#count").textContent = String(tickets.length);
  $("#empty").hidden = tickets.length > 0;
  for (const ticket of tickets) {
    const button = el("button", "ticket-button");
    button.type = "button";
    button.setAttribute("aria-pressed", String(ticket.id === selectedId));
    button.append(el("span", "ticket-subject", ticket.subject));
    const meta = el("span", "ticket-meta");
    meta.append(badge(ticket));
    meta.append(
      el(
        "span",
        "",
        `${ticket.messages.length} réponse${ticket.messages.length > 1 ? "s" : ""}`,
      ),
    );
    button.append(meta);
    button.addEventListener("click", () => {
      selectedId = ticket.id;
      renderList();
      renderDetail();
    });
    const li = el("li");
    li.append(button);
    $("#tickets").append(li);
  }
}

function renderDetail() {
  const detail = $("#detail");
  detail.replaceChildren();
  const ticket = tickets.find((item) => item.id === selectedId);
  if (!ticket) {
    detail.append(el("p", "muted", "Sélectionnez une demande."));
    return;
  }
  const top = el("div", "detail-top");
  top.append(el("span", "ticket-reference", `# ${ticket.id.slice(0, 18)}`));
  const control = el("div", "status-control");
  const label = el("label", "", "Statut");
  label.htmlFor = "ticket-status";
  const select = el("select");
  select.id = "ticket-status";
  select.disabled = busy;
  for (const [value, text] of Object.entries(labels)) {
    const option = el("option", "", text);
    option.value = value;
    select.append(option);
  }
  select.value = ticket.status;
  select.addEventListener("change", () =>
    mutate(() => api.status(ticket.id, select.value)),
  );
  control.append(label, select);
  top.append(control);
  detail.append(
    top,
    el("h2", "", ticket.subject),
    el("p", "date", `Créée le ${date(ticket.createdAt)}`),
    el("p", "description", ticket.description),
  );
  const conversation = el("div", "conversation");
  conversation.append(el("h3", "", "Échanges"));
  if (!ticket.messages.length)
    conversation.append(el("p", "muted", "Aucune réponse pour le moment."));
  for (const message of ticket.messages) {
    const article = el("article", "message");
    const meta = el("div", "message-meta");
    meta.append(
      el("strong", "", message.author),
      document.createTextNode(` · ${date(message.createdAt)}`),
    );
    article.append(meta, el("p", "", message.text));
    conversation.append(article);
  }
  const form = el("form", "reply-form");
  const replyLabel = el("label", "", "Votre réponse");
  replyLabel.htmlFor = "reply";
  const input = el("textarea");
  input.id = "reply";
  input.name = "text";
  input.rows = 3;
  input.required = true;
  input.maxLength = 2000;
  input.placeholder = "Répondre au client…";
  input.value = replyDrafts.get(ticket.id) || "";
  input.addEventListener("input", () =>
    replyDrafts.set(ticket.id, input.value),
  );
  const submit = el("button", "", "Envoyer la réponse");
  submit.type = "submit";
  submit.disabled = busy;
  form.append(replyLabel, input, submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    mutate(
      () => api.reply(ticket.id, input.value),
      () => replyDrafts.delete(ticket.id),
    );
  });
  conversation.append(form);
  detail.append(conversation);
}

async function refresh(preferredId = selectedId) {
  const version = ++loadingVersion;
  const result = await api.list($("#search").value, $("#filter").value);
  if (version !== loadingVersion) return;
  tickets = result.tickets;
  selectedId = tickets.some((ticket) => ticket.id === preferredId)
    ? preferredId
    : tickets[0]?.id;
  $("#summary").replaceChildren();
  for (const [status, singular, plural] of [
    ["ouvert", "ouverte", "ouvertes"],
    ["en_cours", "en cours", "en cours"],
    ["resolu", "résolue", "résolues"],
  ]) {
    const count = result.counts[status];
    const item = el("span");
    item.append(
      el("strong", "", String(count)),
      document.createTextNode(` ${count > 1 ? plural : singular}`),
    );
    $("#summary").append(item);
  }
  renderList();
  renderDetail();
}

async function mutate(action, onSuccess) {
  if (busy) return;
  busy = true;
  $("#error").hidden = true;
  document
    .querySelectorAll("button[type=submit], #ticket-status, #reset")
    .forEach((element) => (element.disabled = true));
  try {
    const result = await action();
    onSuccess?.(result);
    await refresh(result.ticket?.id);
    $("#notice").textContent = "Demande mise à jour.";
  } catch (error) {
    showError(error);
  } finally {
    busy = false;
    // Conserve la réponse saisie si le serveur a refusé l'envoi.
    document
      .querySelectorAll("button[type=submit], #ticket-status, #reset")
      .forEach((element) => (element.disabled = false));
    const current = tickets.find((ticket) => ticket.id === selectedId);
    if (current && $("#ticket-status"))
      $("#ticket-status").value = current.status;
  }
}

function showForm(open) {
  $("#new-form").hidden = !open;
  $("#new-ticket").setAttribute("aria-expanded", String(open));
  if (open) $("#subject").focus();
}
$("#new-ticket").addEventListener("click", () =>
  showForm($("#new-form").hidden),
);
$("#cancel-new").addEventListener("click", () => {
  showForm(false);
  $("#new-ticket").focus();
});
$("#new-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(event.currentTarget));
  mutate(
    () => api.create(input),
    () => {
      $("#new-form").reset();
      showForm(false);
      $("#search").value = "";
      $("#filter").value = "";
      $("#new-ticket").focus();
    },
  );
});
let debounce;
$("#search").addEventListener("input", () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => refresh().catch(showError), 180);
});
$("#filter").addEventListener("change", () => refresh().catch(showError));
$("#reset").addEventListener("click", () => {
  if (
    confirm(
      "Remettre les trois demandes fictives de départ ? Les demandes et réponses ajoutées seront supprimées.",
    )
  )
    mutate(
      () => api.reset(),
      () => {
        replyDrafts.clear();
        $("#search").value = "";
        $("#filter").value = "";
      },
    );
});
refresh().catch(showError);
