// Thin wrapper around fetch that throws on non-2xx.

async function req(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export const api = {
  listDocuments: () => req("/documents"),
  getDocument: (id) => req(`/documents/${id}`),
  createDocument: (body) =>
    req("/documents", { method: "POST", body: JSON.stringify(body) }),
  updateDocument: (id, body) =>
    req(`/documents/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteDocument: (id) =>
    req(`/documents/${id}`, { method: "DELETE" }),
  changeStatus: (id, status) =>
    req(`/documents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getMetrics: () => req("/metrics/aging"),
  getConfig: () => req("/config"),
  saveConfig: (body) =>
    req("/config", { method: "PUT", body: JSON.stringify(body) }),
};
