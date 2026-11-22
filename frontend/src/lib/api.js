const BASE = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

const KEYS = { access: "dp_access", refresh: "dp_refresh" };

export const tokens = {
  get access() { return localStorage.getItem(KEYS.access); },
  get refresh() { return localStorage.getItem(KEYS.refresh); },
  set(t) {
    localStorage.setItem(KEYS.access, t.access_token);
    localStorage.setItem(KEYS.refresh, t.refresh_token);
  },
  clear() {
    localStorage.removeItem(KEYS.access);
    localStorage.removeItem(KEYS.refresh);
  },
};

let onAuthLost = () => {};
export const setAuthLostHandler = (fn) => { onAuthLost = fn; };

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function messageFrom(data, status) {
  const d = data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return d.map((e) => `${e.loc?.at(-1) ?? "field"}: ${e.msg}`).join(" · ");
  }
  return `Something went wrong (${status}).`;
}

let refreshing = null;
function refreshTokens() {
  if (!tokens.refresh) return Promise.resolve(false);
  refreshing ??= fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: tokens.refresh }),
  })
    .then(async (r) => {
      if (!r.ok) return false;
      tokens.set(await r.json());
      return true;
    })
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function api(path, { method = "GET", body, auth = true, retry = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can’t reach the server. Is the backend running?");
  }

  if (res.status === 401 && auth && retry) {
    if (await refreshTokens()) return api(path, { method, body, auth, retry: false });
    tokens.clear();
    onAuthLost();
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, messageFrom(data, res.status));
  return data;
}

export const authApi = {
  register: (body) => api("/auth/register", { method: "POST", body, auth: false }),
  login: (body) => api("/auth/login", { method: "POST", body, auth: false }),
  me: () => api("/users/me"),
  updateMe: (body) => api("/users/me", { method: "PATCH", body }),
};

export const plansApi = {
  create: (query) => api("/plans", { method: "POST", body: { query } }),
  get: (threadId) => api(`/plans/${threadId}`),
  feedback: (threadId, feedback) =>
    api(`/plans/${threadId}/feedback`, { method: "POST", body: { feedback } }),
  approve: (threadId) => api(`/plans/${threadId}/approve`, { method: "POST" }),
  history: (params = {}) => api(`/plans/history?${new URLSearchParams(params)}`),
  saved: (planId) => api(`/plans/saved/${planId}`),
};

export async function downloadPdf(url, filename = "travel-plan.pdf") {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 10_000);
  } catch {
    window.open(url, "_blank", "noopener"); // fall back to opening it in a new tab
  }
}