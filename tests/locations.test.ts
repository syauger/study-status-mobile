/// <reference types="node" />
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { QueryClient } from "@tanstack/react-query";

import {
  getAmenities,
  locationQueryOptions,
  locationsQueryOptions,
} from "../src/features/locations/api";

const originalFetch = globalThis.fetch;
const client = new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: Infinity } },
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  client.clear();
});

const json = (data: unknown, status = 200) => Response.json(data, { status });

test("loads all pages, preserving location order", async () => {
  const urls: string[] = [];
  globalThis.fetch = (input) => {
    urls.push(String(input));
    const secondPage = String(input).endsWith("page=1");
    return Promise.resolve(
      json({
        success: true,
        locations: [{ id: secondPage ? 11 : 1 }],
        nextPage: secondPage ? null : 1,
      })
    );
  };
  const result = await client.fetchQuery({
    ...locationsQueryOptions,
    retry: false,
  });
  assert.deepEqual(
    result.map(({ id }) => id),
    [1, 11]
  );
  assert.equal(urls.length, 2);
});

test("empty list is a successful response", async () => {
  globalThis.fetch = () =>
    Promise.resolve(json({ success: true, locations: [], nextPage: null }));
  assert.deepEqual(await client.fetchQuery(locationsQueryOptions), []);
});

test("an unsuccessful response is an error, not an empty list", async () => {
  globalThis.fetch = () =>
    Promise.resolve(json({ success: false, locations: [] }));
  await assert.rejects(
    client.fetchQuery({ ...locationsQueryOptions, retry: false })
  );
});

test("a repeated pagination cursor fails instead of looping", async () => {
  globalThis.fetch = () =>
    Promise.resolve(json({ success: true, locations: [], nextPage: 0 }));
  await assert.rejects(
    client.fetchQuery({ ...locationsQueryOptions, retry: false })
  );
});

test("detail distinguishes missing locations from server failures", async () => {
  globalThis.fetch = () => Promise.resolve(json({ success: false }, 404));
  assert.equal(await client.fetchQuery(locationQueryOptions("99")), null);
  globalThis.fetch = () => Promise.resolve(json({ success: false }, 500));
  await assert.rejects(
    client.fetchQuery({ ...locationQueryOptions("100"), retry: false })
  );
});

test("invalid IDs do not send a request", async () => {
  globalThis.fetch = () => {
    throw new Error("Unexpected request");
  };
  assert.equal(
    await client.fetchQuery(locationQueryOptions("not-a-number")),
    null
  );
});

test("amenities handle blanks, whitespace, and duplicates", () => {
  assert.deepEqual(getAmenities(" wifi,coffee,,wifi, outdoor "), [
    "Wi-Fi",
    "Coffee",
    "Outdoor space",
  ]);
  assert.deepEqual(getAmenities(""), []);
});
