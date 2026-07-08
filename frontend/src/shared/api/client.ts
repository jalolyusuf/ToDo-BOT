const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type DependencyHealth = {
  status: "ok" | "error";
  detail?: string | null;
};

export type HealthResponse = {
  status: "ok" | "degraded";
  app: DependencyHealth;
  database: DependencyHealth;
  redis: DependencyHealth;
};

export type CurrentUserResponse = {
  id: string;
  telegram_user_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  language_code: string | null;
  can_create_groups: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function authRequest<T>(path: string, authHeader: string): Promise<T> {
  return request<T>(path, {
    headers: {
      Authorization: authHeader,
    },
  });
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/v1/health");
}

export function getAuthMe(authHeader: string): Promise<CurrentUserResponse> {
  return authRequest<CurrentUserResponse>("/api/v1/auth/me", authHeader);
}
