const AUTH_TOKEN_KEY = "synapse_auth_token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const AUTH_LOGOUT_EVENT = "auth:logout";

export const dispatchAuthLogout = (): void => {
  if (typeof window === "undefined") return;
  clearStoredToken();
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
};
