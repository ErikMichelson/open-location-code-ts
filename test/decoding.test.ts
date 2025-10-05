import assert from "node:assert";
import { describe, test } from "node:test";
import { decode } from "../src";
import { runCsvTests } from "./run-csv-tests";

describe("Decoding Tests", async () => {
  await runCsvTests("decoding", (row) => {
    const [_, length, latLo, lngLo, latHi, lngHi] = row.map(Number);
    test(`decode(${row[0]}) should return correct bounds`, () => {
      const result = decode(row[0]);
      assert.strictEqual(
        result.codeLength,
        length,
        `Expected length ${length} but got ${result.codeLength}`,
      );

      assert.ok(
        Math.abs(result.latitudeLo - latLo) < 1e-8,
        `Expected latLo ${latLo} but got ${result.latitudeLo}`,
      );

      assert.ok(
        Math.abs(result.longitudeLo - lngLo) < 1e-8,
        `Expected lngLo ${lngLo} but got ${result.longitudeLo}`,
      );

      assert.ok(
        Math.abs(result.latitudeHi - latHi) < 1e-8,
        `Expected latHi ${latHi} but got ${result.latitudeHi}`,
      );

      assert.ok(
        Math.abs(result.longitudeHi - lngHi) < 1e-8,
        `Expected lngHi ${lngHi} but got ${result.longitudeHi}`,
      );
    });
  });
});
