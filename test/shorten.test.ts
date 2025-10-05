import assert from "node:assert";
import { describe, test } from "node:test";
import { recoverNearest, shorten } from "../src";
import { runCsvTests } from "./run-csv-tests";

describe("Shorten and Recovery Tests", async () => {
  await runCsvTests("shorten", (row) => {
    const [code, latStr, lngStr, shortCode, testType] = row;
    const [lat, lng] = [latStr, lngStr].map(Number);

    if (testType === "S" || testType === "B") {
      test(`shorten(${code}, ${lat}, ${lng}) should return ${shortCode}`, () => {
        const result = shorten(code, lat, lng);
        assert.strictEqual(result, shortCode, `Expected ${shortCode} but got ${result}`);
      });
    }

    if (testType === "R" || testType === "B") {
      test(`recoverNearest(${shortCode}, ${lat}, ${lng}) should return ${code}`, () => {
        const result = recoverNearest(shortCode, lat, lng);
        assert.strictEqual(result, code, `Expected ${code} but got ${result}`);
      });
    }
  });
});
