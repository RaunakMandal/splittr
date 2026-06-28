const STORAGE_KEY = "splittr-auth";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
      exp?: number;
    };

    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }

  return token;
}

export function setAuthToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn(): boolean {
  return Boolean(getAuthToken());
}
