// Contract invariants (M0-SH-03). Node's built-in test runner, no dependencies.
//
// These are the rules the spec must keep holding as it grows past the skeleton.
// A reviewer should not have to remember them.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  OUT_DIR,
  SPEC_PATH,
  renderClient,
  renderServerTypes,
  scanOperations,
} from '../scripts/generate.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yaml = readFileSync(SPEC_PATH, 'utf8');
const lines = yaml.split('\n');
const operations = scanOperations(yaml);

const MUTATING = new Set(['post', 'put', 'patch', 'delete']);

/** Every line indented deeper than `indent`, starting after `start`. */
function blockAfter(start, indent) {
  const collected = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === '') {
      collected.push(line);
      continue;
    }
    const depth = line.length - line.trimStart().length;
    if (depth <= indent) break;
    collected.push(line);
  }
  return collected.join('\n');
}

function findLine(pattern) {
  const index = lines.findIndex((line) => pattern.test(line));
  assert.notEqual(index, -1, `expected to find ${pattern} in openapi.yaml`);
  return index;
}

/** Keys directly under a section header, mapped to their block text. */
function keyedBlocks(headerIndex, keyIndent) {
  const blocks = new Map();
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === '') continue;
    const depth = line.length - line.trimStart().length;
    if (depth < keyIndent) break;
    if (depth !== keyIndent) continue;
    const match = /^\s*([A-Za-z0-9_/{}.-]+):\s*$/.exec(line);
    if (match) blocks.set(match[1], blockAfter(i, keyIndent));
  }
  return blocks;
}

function operationBlock(target) {
  let currentPath = null;
  for (let i = 0; i < lines.length; i += 1) {
    const pathMatch = /^ {2}(\/\S*):\s*$/.exec(lines[i]);
    if (pathMatch) {
      currentPath = pathMatch[1];
      continue;
    }
    const methodMatch = /^ {4}([a-z]+):\s*$/.exec(lines[i]);
    if (!methodMatch) continue;
    if (currentPath !== target.path || methodMatch[1] !== target.method) continue;
    return blockAfter(i, 4);
  }
  throw new Error(`no block for ${target.method} ${target.path}`);
}

test('every operation has a unique operationId', () => {
  assert.ok(operations.length >= 19, `only ${operations.length} operations scanned`);
  const ids = operations.map((op) => op.operationId);
  assert.equal(new Set(ids).size, ids.length);
});

test('every mutating operation declares Idempotency-Key', () => {
  for (const op of operations.filter((candidate) => MUTATING.has(candidate.method))) {
    const block = operationBlock(op);
    assert.match(
      block,
      /parameters:[\s\S]*#\/components\/parameters\/IdempotencyKey/,
      `${op.method.toUpperCase()} ${op.path} is mutating but does not declare Idempotency-Key`,
    );
  }
});

test('Idempotency-Key is required wherever it is declared', () => {
  const parametersHeader = findLine(/^ {2}parameters:\s*$/);
  const params = keyedBlocks(parametersHeader, 4);
  const idempotency = params.get('IdempotencyKey');
  assert.ok(idempotency, 'IdempotencyKey parameter component missing');
  assert.match(idempotency, /required: true/);
});

test('every operation can fail with the shared error envelope', () => {
  for (const op of operations) {
    const block = operationBlock(op);
    assert.match(
      block,
      /#\/components\/responses\/InternalError/,
      `${op.method.toUpperCase()} ${op.path} does not reference the shared error responses`,
    );
  }
});

test('every error response component uses the one Error schema', () => {
  const componentsIndex = findLine(/^components:\s*$/);
  const responsesHeader = lines.findIndex(
    (line, index) => index > componentsIndex && /^ {2}responses:\s*$/.test(line),
  );
  const responses = keyedBlocks(responsesHeader, 4);
  const errorResponses = [
    'BadRequest',
    'Unauthorized',
    'Forbidden',
    'NotFound',
    'NotAcceptable',
    'IdempotencyConflict',
    'UnprocessableEntity',
    'TooManyRequests',
    'InternalError',
  ];
  for (const name of errorResponses) {
    const block = responses.get(name);
    assert.ok(block, `error response ${name} missing`);
    assert.match(block, /#\/components\/schemas\/Error/, `${name} does not use the Error envelope`);
  }
});

test('every response body is served under the versioned media type', () => {
  const bodyMediaTypes = yaml
    .split('\n')
    .filter((line) => /^ {8,}application\/[a-z0-9.+-]+:\s*$/.test(line))
    .map((line) => line.trim().replace(/:$/, ''));
  const unexpected = bodyMediaTypes.filter(
    (type) => type !== 'application/vnd.staffroom.v1+json' && type !== 'application/json',
  );
  assert.deepEqual(unexpected, [], `unexpected media types: ${unexpected.join(', ')}`);
  assert.ok(bodyMediaTypes.includes('application/vnd.staffroom.v1+json'));
});

test('every response with a body carries an example, so Prism can serve it', () => {
  const componentsIndex = findLine(/^components:\s*$/);
  const responsesHeader = lines.findIndex(
    (line, index) => index > componentsIndex && /^ {2}responses:\s*$/.test(line),
  );
  for (const [name, block] of keyedBlocks(responsesHeader, 4)) {
    if (!block.includes('content:')) continue;
    assert.match(block, /examples:\s*\n\s+default:/, `response ${name} has no example`);
  }
});

test('cursor pagination is defined once and reused by every list', () => {
  const schemasHeader = findLine(/^ {2}schemas:\s*$/);
  const schemas = keyedBlocks(schemasHeader, 4);
  assert.ok(schemas.get('PageInfo'), 'PageInfo schema missing');
  for (const name of ['FeedPage', 'AgentPage', 'SearchPage']) {
    const block = schemas.get(name);
    assert.ok(block, `${name} missing`);
    assert.match(block, /#\/components\/schemas\/PageInfo/, `${name} does not reuse PageInfo`);
  }
  assert.doesNotMatch(yaml, /name: offset\b/, 'offset pagination has no place in this API');
});

test('agent ink is a token name, never a hex value', () => {
  const schemasHeader = findLine(/^ {2}schemas:\s*$/);
  const ink = keyedBlocks(schemasHeader, 4).get('AgentInk');
  assert.ok(ink, 'AgentInk schema missing');
  const declared = /enum: \[([^\]]+)\]/.exec(ink);
  assert.ok(declared, 'AgentInk has no enum');
  assert.deepEqual(
    declared[1].split(',').map((value) => value.trim()),
    ['bricklayer', 'ledger', 'marguerite', 'sprout', 'grouse', 'vellum', 'neutral'],
  );
});

test('GitHub-derived identity fields exist only on AdminUser (D-029)', () => {
  // The one-way door: outside AdminUser (admin-only, /v1/admin/* — P-09),
  // no schema, response or example may carry a fingerprint field. `email`
  // does not exist anywhere yet; the assertion keeps it that way.
  const schemasHeader = findLine(/^ {2}schemas:\s*$/);
  const schemas = keyedBlocks(schemasHeader, 4);
  const adminBlock = schemas.get('AdminUser');
  assert.ok(adminBlock, 'AdminUser schema missing');
  for (const field of ['github_id', 'github_created_at', 'github_public_repos', 'tier_would_be']) {
    assert.match(adminBlock, new RegExp(`^\\s+${field}:`, 'm'), `AdminUser lost ${field}`);
  }
  const outsideAdmin = yaml.replace(adminBlock, '');
  assert.doesNotMatch(
    outsideAdmin,
    /^\s+(github_id|github_created_at|github_public_repos|tier_would_be|email):/m,
    'an admin-only identity field leaked outside AdminUser (D-029)',
  );
});

test('no hex colour appears anywhere in the contract', () => {
  const hex = yaml.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
  assert.deepEqual(hex, [], `hex values leaked into the contract: ${hex.join(', ')}`);
});

test('generated client and server types are in sync with the spec', () => {
  const client = readFileSync(path.join(OUT_DIR, 'client.ts'), 'utf8');
  const serverTypes = readFileSync(path.join(OUT_DIR, 'server-types.ts'), 'utf8');
  assert.equal(client, renderClient(operations), 'generated/client.ts is stale — run pnpm generate');
  assert.equal(
    serverTypes,
    renderServerTypes(operations),
    'generated/server-types.ts is stale — run pnpm generate',
  );
});

test('the route table covers every operation exactly once', () => {
  const serverTypes = readFileSync(path.join(OUT_DIR, 'server-types.ts'), 'utf8');
  for (const op of operations) {
    assert.match(
      serverTypes,
      new RegExp(`\\n  ${op.operationId}: \\{ method: '${op.method}', path: '${op.path.replace(/[{}]/g, '\\$&')}'`),
      `${op.operationId} missing from ROUTES`,
    );
  }
});

test('the package never grows a runtime dependency', () => {
  const pkg = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies, undefined, 'contracts must stay dependency-free at runtime');
  assert.deepEqual(Object.keys(pkg.devDependencies ?? {}), ['openapi-typescript']);
});
