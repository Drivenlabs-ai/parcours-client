async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "La demande a échoué.");
  return payload;
}

export const api = {
  list: (query = "", status = "") =>
    request(`/api/tickets?${new URLSearchParams({ q: query, status })}`),
  create: (input) =>
    request("/api/tickets", { method: "POST", body: JSON.stringify(input) }),
  status: (id, status) =>
    request(`/api/tickets/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  reply: (id, text) =>
    request(`/api/tickets/${encodeURIComponent(id)}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  reset: () => request("/api/reset", { method: "POST", body: "{}" }),
};
