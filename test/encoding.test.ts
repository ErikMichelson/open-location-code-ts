import * as assert from "node:assert";
import { describe, test } from "node:test";
import { decode, encode } from "../src";
import { locationToIntegers } from "../src/open-location-code";
import { runCsvTests } from "./run-csv-tests";

describe("Encoding Tests", async () => {
  await runCsvTests("encoding", (row) => {
    const [latStr, lngStr, latNumStr, lngNumStr, lengthStr, code] = row;
    const [lat, lng, length, latNum, lngNum] = [
      latStr,
      lngStr,
      lengthStr,
      latNumStr,
      lngNumStr,
    ].map(Number);
    test(`locationToIntegers(${lat}, ${lng}) should return (${latNum}, ${lngNum})`, () => {
      const [resultLat, resultLng] = locationToIntegers(lat, lng);
      assert.strictEqual(
        [latNum, latNum - 1].includes(resultLat),
        true,
        `Expected latitude integer ${latNum} (or ${latNum - 1}) but got ${resultLat}`,
      );
      assert.strictEqual(
        [lngNum, lngNum - 1].includes(resultLng),
        true,
        `Expected longitude integer ${lngNum} (or ${lngNum - 1}) but got ${resultLng}`,
      );
    });

    test(`encode(${lat}, ${lng}, ${length}) should return ${code}`, () => {
      try {
        const result = encode(lat, lng, length);
        if (code !== result) {
          // Rounding errors can cause the code to be minimally different from the expected code.
          const decoded = decode(result);
          const diffLat = Math.abs(decoded.latitudeCenter - lat);
          const diffLng = Math.abs(decoded.longitudeCenter - lng);
          assert.ok(
            diffLat < 1e-4,
            `Code ${result} does not match expected ${code} and is not in rounding error distance (lat diff: ${diffLat})`,
          );
          assert.ok(
            diffLng < 1e-4,
            `Code ${result} does not match expected ${code} and is not in rounding error distance (lng diff: ${diffLng})`,
          );
          return;
        }
        assert.strictEqual(result, code, `Expected ${code} but got ${result}`);
      } catch (error) {
        if (code) {
          throw new Error(`Failed to encode ${lat}, ${lng}, ${length}: ${error}`);
        }
      }
    });
  });
});
