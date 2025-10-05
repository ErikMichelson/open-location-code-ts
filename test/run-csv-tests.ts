import { parseFile } from "@fast-csv/parse";

const base = import.meta.dirname;

/**
 * Runs a CSV test file and calls the provided function for each row.
 *
 * @param testFile The name of the test file to run.
 * @param testFn The function to call for each row.
 */
export function runCsvTests(testFile: string, testFn: (row: string[]) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    parseFile(`${base}/data/${testFile}.csv`, {
      headers: false,
      comment: "#",
    })
      .on("error", (error) => {
        reject(error);
        return;
      })
      .on("data", testFn)
      .on("end", (rowCount: number) => {
        console.log(`Running ${rowCount} tests for ${testFile}`);
        resolve();
      });
  });
}
