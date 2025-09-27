const raw = import.meta.env.VITE_API_BASE;

const normalize = (value) => value.replace(/\/$/, "");

const detectLocalApi = () => {
  if (typeof window === "undefined") return null;
  const { protocol, hostname, port } = window.location;
  if (port === "5173") {
    return `${protocol}//${hostname}:8000/api`;
  }
  return `${window.location.origin}/api`;
};

const resolved = raw && raw.trim().length ? normalize(raw.trim()) : detectLocalApi();

export const API_BASE = resolved ?? "/api";
