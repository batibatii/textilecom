type ApiHelperOptions = {
  method: "GET" | "POST" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export async function callApi<T>(
  endpoint: string,
  options: ApiHelperOptions
): Promise<T> {
  const origin = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const url = `${origin}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config: RequestInit = {
    method: options.method,
    headers,
  };

  if (options.body && options.method !== "GET") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}
