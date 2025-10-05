# open-location-code-ts

A modern TypeScript port of the Open Location Code JavaScript library.

## Open Location Codes / "Plus Codes"

Open Location Codes (OLC), also known as "Plus Codes", are a geocoding system developed by Google to represent
geographic coordinates as short, easy-to-use codes.
They enable precise location sharing without the need for traditional addresses, making them especially useful in areas
lacking formal addressing systems.

For more details, see [the plus.codes webpage](https://plus.codes/) and the
[Open Location Code project](https://github.com/google/open-location-code).

## This project

There is no up-to-date version of the Open Location Code library on npm available, and the original codebase
is written in an old style of JavaScript. This library aims to provide a clean, modern, and type-safe implementation
while maintaining compatibility with the original library.

## Installation

```bash
npm install @erikmichelson/open-location-code-ts
```

## Browser import

This library is available as an ES module as well as a global bundle, which can be imported directly in the browser.
The global bundle is available as `OpenLocationCode`.

```html
<!-- ES module -->
<script type="module">
    import { encode, decode, isValid, isShort, isFull, recoverNearest, shorten } from 'https://cdn.jsdelivr.net/npm/@erikmichelson/open-location-code-ts/dist/open-location-code.esm.js';
    // decode("849VCWC8+Q4") ...
</script>

<!-- Global bundle -->
<script src="https://cdn.jsdelivr.net/npm/@erikmichelson/open-location-code-ts/dist/open-location-code.browser.js"></script>
<script>
    // OpenLocationCode.decode("849VCWC8+Q4") ...
</script>
```

## Usage

```javascript
import {
    encode,
    decode,
    isValid,
    isShort,
    isFull,
    recoverNearest,
    shorten
} from '@erikmichelson/open-location-code-ts';

const code = encode(37.421908, -122.084681);
console.log(code); // '849VCWC8+Q4'

console.log(isValid(code)); // true
console.log(isShort(code)); // false
console.log(isFull(code)); // true

const location = decode('849VCWC8+Q9');
console.log(location); // {
                       //   latitudeLo: 37.421875,
                       //   latitudeCenter: 37.4219375,
                       //   latitudeHi: 37.422,
                       //   longitudeLo: -122.08475,
                       //   longitudeCenter: -122.0846875,
                       //   longitudeHi: -122.084625,
                       //   codeLength: 10
                       // }

const latMountainView = 37.39;
const lonMountainView = -122.08;

const shortened = shorten(code, latMountainView, lonMountainView);
console.log(shortened); // 'CWC8+Q4'

console.log(isValid(code)); // true
console.log(isShort(code)); // true
console.log(isFull(code)); // false

const recovered = recoverNearest(shortened, latMountainView, lonMountainView);
console.log(recovered); // '849VCWC8+Q4'
```

Full API documentation is available at <https://erikmichelson.github.io/open-location-code-ts/>.

## License and credits

This code is based on the original JavaScript implementation by *The Open Location Code Library Authors*.

Licensed under Apache 2.0.
