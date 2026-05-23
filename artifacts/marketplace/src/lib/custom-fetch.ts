let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, statusText: response.statusText, data: errorData };
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}
