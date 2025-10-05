# Agent Integration Guide for @erikmichelson/open-location-code-ts

This document provides guidance for automated agents, bots, and scripts integrating with the Open Location Code TypeScript library.
It is intended for developers building automation, CI/CD pipelines, or programmatic consumers.

---

## 1. Installation

Agents should install the package using npm:

    npm install @erikmichelson/open-location-code-ts

Refer to the [README](./README.md) for more details.

---

## 2. Usage

- Import only the functions you need: `encode`, `decode`, `isValid`, `isShort`, `isFull`, `recoverNearest`, `shorten`.
- All functions are pure and stateless, making them safe for concurrent and repeated use in automated workflows.
- The package is fully type-safe and compatible with TypeScript and modern JavaScript runtimes.

Example (Node.js/TypeScript):

```ts
import { encode, decode } from '@erikmichelson/open-location-code-ts';
const code = encode(37.421908, -122.084681);
const location = decode(code);
```

---

## 3. API Documentation

- The library is fully documented using TypeDoc annotations and JSDoc comments.
- The documentation is generated from the source code and is available online at <https://erikmichelson.github.io/open-location-code-ts/>.
- The local documentation can be generated using `npm run build:docs`.
- After generating the local documentation, it is available in the `docs/` directory.

---

## 4. Building

- The library can be built using `npm run build`.
- There are two outputs generated:
  - `dist/index.js`: ES module for modern bundlers and environments.
  - `dist/open-location-code.browser.js`: Bundle for direct browser usage, exporting global variable `OpenLocationCode`.
- Each output has a source map for debugging, is minified, and has a TypeScript declaration file.

---

## 5. Testing

- The repository contains automated tests with the node internal test runner.
- For test data, see the `test/data/` directory for CSV files covering encoding, decoding, shortening, and validity cases.
- Run tests using `npm test`.

---

## 6. Code style

- This project uses Biome for linting and formatting.
- Run the checks using `npm run check`.
- Simple fixes can be applied automatically using `npm run fix`.
