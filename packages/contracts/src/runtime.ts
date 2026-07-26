// Hand-written fetch core for the generated client (M0-SH-03).
//
// Deliberately dependency-free and platform-neutral: no DOM lib, no @types/node,
// no fetch wrapper library. `fetch` is described structurally so this runs
// unchanged in the browser, in Node 22, and in React Native.

/** The one media type this contract serves. system-design §2. */
export const API_MEDIA_TYPE = 'application/vnd.staffroom.v1+json';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface FetchResponseLike {
  readonly ok: boolean;
  readonly status: number;
  readonly headers: { get(name: string): string | null };
  text(): Promise<string>;
}

export interface FetchInitLike {
  method: string;
  headers: Record<string, string>;
  body?: string;
  credentials?: string;
  signal?: unknown;
}

export type FetchLike = (url: string, init: FetchInitLike) => Promise<FetchResponseLike>;

export interface ClientOptions {
  /** Origin plus version prefix, e.g. `http://127.0.0.1:4000/v1`. No trailing slash. */
  baseUrl: string;
  /** Defaults to the ambient `fetch`. Pass one explicitly in tests. */
  fetch?: FetchLike;
  /** Sent on every request, before per-call headers. */
  headers?: Record<string, string>;
  /** Cookie auth needs `include` cross-origin; that is the default. */
  credentials?: string;
}

/** Loose shape the generated client narrows per operation. */
export interface GenericArgs {
  path?: Record<string, string | number>;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: unknown;
  extraHeaders?: Record<string, string>;
  signal?: unknown;
}

export interface ErrorDetail {
  field: string;
  issue: string;
  detail?: string;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
    request_id: string;
  };
}

/** Every non-2xx response arrives as this. Switch on `code`, never on `message`. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string | undefined;
  readonly details: readonly ErrorDetail[];
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    const envelope = isErrorEnvelope(body) ? body.error : undefined;
    super(envelope?.message ?? `request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = envelope?.code ?? 'internal';
    this.requestId = envelope?.request_id;
    this.details = envelope?.details ?? [];
    this.body = body;
  }
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = (value as { error?: unknown }).error;
  return typeof candidate === 'object' && candidate !== null && 'code' in candidate;
}

function resolveFetch(options: ClientOptions): FetchLike {
  if (options.fetch) return options.fetch;
  const ambient = (globalThis as { fetch?: FetchLike }).fetch;
  if (!ambient) {
    throw new Error('no fetch available — pass options.fetch');
  }
  return ambient;
}

function fillPath(template: string, params: Record<string, string | number> | undefined): string {
  return template.replace(/\{([^}]+)\}/g, (_match, name: string) => {
    const value = params?.[name];
    if (value === undefined) {
      throw new Error(`missing path parameter "${name}" for ${template}`);
    }
    return encodeURIComponent(String(value));
  });
}

function buildQuery(query: Record<string, unknown> | undefined): string {
  if (!query) return '';
  const parts: string[] = [];
  for (const key of Object.keys(query)) {
    const value = query[key];
    if (value === undefined || value === null) continue;
    const encodedKey = encodeURIComponent(key);
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue;
        parts.push(`${encodedKey}=${encodeURIComponent(String(item))}`);
      }
      continue;
    }
    parts.push(`${encodedKey}=${encodeURIComponent(String(value))}`);
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

async function readBody(response: FetchResponseLike): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (text.length === 0) return undefined;
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Builds the single request function the generated client binds its operations
 * to. Sets the version header on every call — that is where the `Accept` rule
 * is enforced, because OpenAPI ignores `Accept` declared as a parameter.
 */
export function createRequester(options: ClientOptions) {
  const doFetch = resolveFetch(options);
  const baseUrl = options.baseUrl.replace(/\/+$/, '');

  return async function call(
    method: HttpMethod,
    template: string,
    args: GenericArgs | undefined,
  ): Promise<unknown> {
    const url = `${baseUrl}${fillPath(template, args?.path)}${buildQuery(args?.query)}`;

    const headers: Record<string, string> = {
      accept: API_MEDIA_TYPE,
      ...options.headers,
      ...args?.headers,
      ...args?.extraHeaders,
    };

    const init: FetchInitLike = {
      method: method.toUpperCase(),
      headers,
      credentials: options.credentials ?? 'include',
    };
    if (args?.signal !== undefined) init.signal = args.signal;
    if (args?.body !== undefined) {
      headers['content-type'] = 'application/json';
      init.body = JSON.stringify(args.body);
    }

    const response = await doFetch(url, init);
    const body = await readBody(response);
    if (!response.ok) {
      throw new ApiError(response.status, body);
    }
    return body;
  };
}
