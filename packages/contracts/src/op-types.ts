// Type-level derivations over the openapi-typescript output (M0-SH-03).
//
// The generated client and server types are thin: all the inference lives here,
// hand-written once, so regenerating the spec never regenerates logic.

import type { API_MEDIA_TYPE } from './runtime.js';

type MediaType = typeof API_MEDIA_TYPE;

type Defined<T> = T extends undefined ? never : T;

/** `unknown` when the operation has no such part, so intersections stay clean. */
type Part<K extends string, T> = [T] extends [never]
  ? unknown
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {} extends T
    ? { [P in K]?: T }
    : { [P in K]: T };

export type PathParamsOf<O> = O extends { parameters: { path: infer P } } ? Defined<P> : never;

export type QueryParamsOf<O> = O extends { parameters: { query?: infer Q } } ? Defined<Q> : never;

export type HeaderParamsOf<O> = O extends { parameters: { header: infer H } } ? Defined<H> : never;

export type BodyOf<O> = O extends { requestBody?: { content: { 'application/json': infer B } } }
  ? Defined<B>
  : never;

type ResponseOf<O, S extends number> = O extends { responses: infer R }
  ? S extends keyof R
    ? R[S]
    : never
  : never;

type ContentOf<R> = R extends { content: { [K in MediaType]: infer B } } ? B : never;

/** Body of the operation's success response; `void` for 204 and redirects. */
export type OperationResult<O> = [ContentOf<ResponseOf<O, 200>>] extends [never]
  ? [ContentOf<ResponseOf<O, 201>>] extends [never]
    ? void
    : ContentOf<ResponseOf<O, 201>>
  : ContentOf<ResponseOf<O, 200>>;

/** Everything a caller must supply. Required header params — Idempotency-Key on
 *  every mutating operation — are required here too, at compile time. */
export type OperationArgs<O> = Part<'path', PathParamsOf<O>> &
  Part<'query', QueryParamsOf<O>> &
  Part<'headers', HeaderParamsOf<O>> &
  Part<'body', BodyOf<O>> & {
    /** Merged last; escape hatch for tracing headers, never for `Accept`. */
    extraHeaders?: Record<string, string>;
    signal?: unknown;
  };

/** `client.getSession()` when nothing is required, `client.getPost({...})` when it is. */
// eslint-disable-next-line @typescript-eslint/ban-types
export type ClientArgs<O> = {} extends OperationArgs<O>
  ? [args?: OperationArgs<O>]
  : [args: OperationArgs<O>];

/** What a route handler receives, once the server has validated the request. */
export interface OperationRequest<O> {
  params: [PathParamsOf<O>] extends [never] ? Record<string, never> : PathParamsOf<O>;
  query: [QueryParamsOf<O>] extends [never] ? Record<string, never> : QueryParamsOf<O>;
  headers: [HeaderParamsOf<O>] extends [never] ? Record<string, never> : HeaderParamsOf<O>;
  body: [BodyOf<O>] extends [never] ? undefined : BodyOf<O>;
}

/** The shape `apps/api` binds to an operationId. */
export type RouteHandler<O> = (
  request: OperationRequest<O>,
) => Promise<OperationResult<O>> | OperationResult<O>;
