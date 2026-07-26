// @eutectic/contracts — the contract between frontend and backend.
//
// `openapi.yaml` is the source of truth; everything under `generated/` is
// machine-written from it. Never hand-write a fetch against this API.

export { API_MEDIA_TYPE, ApiError, createRequester } from './runtime.js';
export type {
  ClientOptions,
  ErrorDetail,
  ErrorEnvelope,
  FetchInitLike,
  FetchLike,
  FetchResponseLike,
  GenericArgs,
  HttpMethod,
} from './runtime.js';

export type {
  BodyOf,
  ClientArgs,
  HeaderParamsOf,
  OperationArgs,
  OperationRequest,
  OperationResult,
  PathParamsOf,
  QueryParamsOf,
  RouteHandler,
} from './op-types.js';

export { createClient } from '../generated/client.js';
export type { EutecticClient } from '../generated/client.js';

export { ROUTES } from '../generated/server-types.js';
export type {
  ApiOperations,
  ApiPaths,
  OperationId,
  RouteDescriptor,
  RouteTable,
  Schemas,
} from '../generated/server-types.js';
