export const MP_API = "https://api.mercadopago.com";

export const USE_SANDBOX = process.env.MERCADO_PAGO_SANDBOX === "true";

export function mpFetch(path: string, options?: RequestInit) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN not set");
  return fetch(`${MP_API}${path}`, {
    method: options?.method ?? "POST",
    body: options?.body,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
}

export async function mpJson<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await mpFetch(path, {
    method: body ? "POST" : "GET",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json: any = await res.json();
  if (!res.ok) {
    const err = new Error(json.message ?? "MP API error");
    (err as any).status = res.status;
    (err as any).mpError = json;
    throw err;
  }
  return json;
}
