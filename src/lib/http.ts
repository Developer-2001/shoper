"use client";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function http<T>(url: string, options: FetchOptions = {}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message ?? "Request failed");
  }

  return json.data as T;
}
