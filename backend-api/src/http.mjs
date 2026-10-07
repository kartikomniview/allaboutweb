export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "BAD_REQUEST", "Request body must be valid JSON");
  }
}

// HTTP API (payload v2) lowercases header names, but don't rely on it.
export function header(event, name) {
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(event.headers ?? {})) {
    if (key.toLowerCase() === wanted) return value;
  }
  return undefined;
}

export function bearerToken(event) {
  const match = /^Bearer\s+(.+)$/i.exec(header(event, "authorization") ?? "");
  return match ? match[1].trim() : undefined;
}
