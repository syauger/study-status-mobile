import assert from "node:assert/strict";
import { test } from "node:test";

import {
  distanceInMiles,
  formatDistance,
} from "../src/features/locations/distance";

test("straight-line distance handles identical points and a known equatorial arc", () => {
  const origin = { latitude: 0, longitude: 0 };
  assert.equal(distanceInMiles(origin, origin), 0);
  assert.ok(
    Math.abs(distanceInMiles(origin, { latitude: 0, longitude: 1 }) - 69.0934) <
      0.0005
  );
  assert.ok(
    Math.abs(
      distanceInMiles(
        { latitude: 0, longitude: 179.5 },
        { latitude: 0, longitude: -179.5 }
      ) - 69.0934
    ) < 0.0005
  );
});

test("imperial distances format nearby feet and miles clearly", () => {
  assert.equal(formatDistance(0), "Under 50 ft");
  assert.equal(formatDistance(250 / 5280), "250 ft");
  assert.equal(formatDistance(0.1), "0.1 mi");
  assert.equal(formatDistance(1.24), "1.2 mi");
  assert.equal(formatDistance(1234.4), "1,234 mi");
});
