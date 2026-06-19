export async function uploadImage(file: File, getToken?: () => Promise<string | null>): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  const token = await getToken?.();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch("/api/uploads", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Error al subir imagen");
  }

  const data = await res.json() as { url: string };
  return data.url;
}
