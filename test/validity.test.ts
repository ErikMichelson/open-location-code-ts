import assert from "node:assert";
import { describe, test } from "node:test";
import { isFull, isShort, isValid } from "../src";
import { runCsvTests } from "./run-csv-tests";

describe("Validity Tests", async () => {
  await runCsvTests("validity", (row) => {
    const [code, isValidStr, isShortStr, isFullStr] = row;
    const [isValidBool, isShortBool, isFullBool] = [isValidStr, isShortStr, isFullStr].map(
      (x) => x === "true",
    );

    test(`isValid(${code}) should return ${isValidBool}`, () => {
      const result = isValid(code);
      assert.strictEqual(
        result,
        isValidBool,
        `Expected isValid to be ${isValidBool} but got ${result} for code ${code}`,
      );
    });

    test(`isShort(${code}) should return ${isShortBool}`, () => {
      const result = isShort(code);
      assert.strictEqual(
        result,
        isShortBool,
        `Expected isShort to be ${isShortBool} but got ${result} for code ${code}`,
      );
    });

    test(`isFull(${code}) should return ${isFullBool}`, () => {
      const result = isFull(code);
      assert.strictEqual(
        result,
        isFullBool,
        `Expected isFull to be ${isFullBool} but got ${result} for code ${code}`,
      );
    });
  });
});
