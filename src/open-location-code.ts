import { CodeArea } from "./code-area";
import {
  CODE_ALPHABET_,
  CODE_PRECISION_EXTRA,
  CODE_PRECISION_NORMAL,
  ENCODING_BASE_,
  FINAL_LAT_PRECISION_,
  FINAL_LNG_PRECISION_,
  GRID_CODE_LENGTH_,
  GRID_COLUMNS_,
  GRID_LAT_FIRST_PLACE_VALUE_,
  GRID_LNG_FIRST_PLACE_VALUE_,
  GRID_ROWS_,
  LATITUDE_MAX_,
  LONGITUDE_MAX_,
  MAX_DIGIT_COUNT_,
  MIN_DIGIT_COUNT_,
  MIN_TRIMMABLE_CODE_LEN_,
  PADDING_CHARACTER_,
  PAIR_CODE_LENGTH_,
  PAIR_FIRST_PLACE_VALUE_,
  PAIR_PRECISION_,
  PAIR_RESOLUTIONS_,
  SEPARATOR_,
  SEPARATOR_POSITION_,
} from "./constants";

/** @return {string} Returns the OLC alphabet. */
export const getAlphabet = (): string => CODE_ALPHABET_;

/**
 * Determines if a code is valid.
 *
 * To be valid, all characters must be from the Open Location Code character
 * set with at most one separator. The separator can be in any even-numbered
 * position up to the eighth digit.
 *
 * @param {string} code The string to check.
 * @return {boolean} True if the string is a valid code.
 */
export function isValid(code: string): boolean {
  // Empty string is not a valid code.
  if (!code) {
    return false;
  }
  const separatorPosition = code.indexOf(SEPARATOR_);
  if (
    // The separator is required.
    separatorPosition === -1 ||
    separatorPosition !== code.lastIndexOf(SEPARATOR_) ||
    // Is it the only character?
    code.length === 1 ||
    // Is it in an illegal position?
    separatorPosition > SEPARATOR_POSITION_ ||
    separatorPosition % 2 === 1
  ) {
    return false;
  }
  const paddingCharPosition = code.indexOf(PADDING_CHARACTER_);
  if (
    // We can have an even number of padding characters before the separator,
    // but then it must be the final character.
    paddingCharPosition > -1
  ) {
    const padMatch = code.match(new RegExp(`(${PADDING_CHARACTER_}+)`, "g"));
    if (
      // Short codes cannot have padding
      separatorPosition < SEPARATOR_POSITION_ ||
      // Not allowed to start with them!
      paddingCharPosition === 0 ||
      // There can only be one group and it must have even length.
      !padMatch ||
      padMatch.length > 1 ||
      padMatch[0].length % 2 === 1 ||
      padMatch[0].length > SEPARATOR_POSITION_ - 2 ||
      // If the code is long enough to end with a separator, make sure it does.
      code.charAt(code.length - 1) !== SEPARATOR_
    ) {
      return false;
    }
  }
  // If there are characters after the separator, make sure there isn't just
  // one of them (not legal).
  if (code.length - separatorPosition - 1 === 1) {
    return false;
  }

  // Strip the separator and any padding characters.
  code = code
    .replace(new RegExp(`\\${SEPARATOR_}+`), "")
    .replace(new RegExp(`${PADDING_CHARACTER_}+`), "");

  // Check the code contains only valid characters.
  const alphabetRegex = new RegExp(`^[${CODE_ALPHABET_}\\${SEPARATOR_}]+$`, "i");
  return alphabetRegex.test(code);
}

/**
 * Determines if a code is a valid short code.
 *
 * @param {string} code The string to check.
 * @return {boolean} True if the string can be produced by removing four or
 *     more characters from the start of a valid code.
 */
export function isShort(code: string): boolean {
  // Check it's valid.
  if (!isValid(code)) {
    return false;
  }
  // Check if there are fewer characters than expected before the SEPARATOR.
  const separatorPosition = code.indexOf(SEPARATOR_);
  return separatorPosition >= 0 && separatorPosition < SEPARATOR_POSITION_;
}

/**
 * Determines if a code is a valid full Open Location Code.
 *
 * @param {string} code The string to check.
 * @return {boolean} True if the code represents a valid latitude and
 *     longitude combination.
 */
export function isFull(code: string): boolean {
  if (
    // Check it's valid.
    !isValid(code) ||
    // If it's short, it's not full.
    isShort(code)
  ) {
    return false;
  }
  // Work out what the first latitude character indicates for latitude.
  const firstLatValue = CODE_ALPHABET_.indexOf(code.charAt(0).toUpperCase()) * ENCODING_BASE_;
  if (firstLatValue >= LATITUDE_MAX_ * 2) {
    // The code would decode to a latitude of >= 90 degrees.
    return false;
  }
  if (code.length > 1) {
    // Work out what the first longitude character indicates for longitude.
    const firstLngValue = CODE_ALPHABET_.indexOf(code.charAt(1).toUpperCase()) * ENCODING_BASE_;
    // The code would decode to a longitude of >= 180 degrees.
    if (firstLngValue >= LONGITUDE_MAX_ * 2) {
      return false;
    }
  }
  return true;
}

/**
 * Encode a location into an Open Location Code.
 *
 * @param {number} latitude The latitude in signed decimal degrees. It will
 *     be clipped to the range -90 to 90.
 * @param {number} longitude The longitude in signed decimal degrees. Will be
 *     normalised to the range -180 to 180.
 * @param {?number} codeLength The length of the code to generate. If
 *     omitted, the value OpenLocationCode.CODE_PRECISION_NORMAL will be used.
 *     For a more precise result, OpenLocationCode.CODE_PRECISION_EXTRA is
 *     recommended.
 * @return {string} The code.
 * @throws {Error} if any of the input values are not numbers.
 */
export function encode(latitude: number, longitude: number, codeLength?: number): string {
  latitude = Number(latitude);
  longitude = Number(longitude);
  const [latInt, lngInt] = locationToIntegers(latitude, longitude);
  return encodeIntegers(latInt, lngInt, codeLength);
}

/**
 * Convert a latitude, longitude location into integer values.
 *
 * This function is only exposed for testing.
 *
 * Latitude is converted into a positive integer clipped into the range
 * 0 <= X < 180*2.5e7. (Latitude 90 needs to be adjusted to be slightly lower
 * so that the returned code can also be decoded.
 * Longitude is converted into a positive integer and normalized into the range
 * 0 <= X < 360*8.192e6.

 * @param {number} latitude
 * @param {number} longitude
 * @return {[number, number]} A tuple of the latitude integer and longitude integer.
 */
export function locationToIntegers(latitude: number, longitude: number): [number, number] {
  let latVal = Math.floor(latitude * FINAL_LAT_PRECISION_);
  latVal += LATITUDE_MAX_ * FINAL_LAT_PRECISION_;
  if (latVal < 0) {
    latVal = 0;
  } else if (latVal >= 2 * LATITUDE_MAX_ * FINAL_LAT_PRECISION_) {
    latVal = 2 * LATITUDE_MAX_ * FINAL_LAT_PRECISION_ - 1;
  }

  let lngVal = Math.floor(longitude * FINAL_LNG_PRECISION_);
  lngVal += LONGITUDE_MAX_ * FINAL_LNG_PRECISION_;
  if (lngVal < 0) {
    lngVal =
      (lngVal % (2 * LONGITUDE_MAX_ * FINAL_LNG_PRECISION_)) +
      2 * LONGITUDE_MAX_ * FINAL_LNG_PRECISION_;
  } else if (lngVal >= 2 * LONGITUDE_MAX_ * FINAL_LNG_PRECISION_) {
    lngVal = lngVal % (2 * LONGITUDE_MAX_ * FINAL_LNG_PRECISION_);
  }
  return [latVal, lngVal];
}

/**
 * Encode a location that uses integer values into an Open Location Code.
 *
 * This is a testing function, and should not be called directly.
 *
 * @param {number} latIntIn An integer latitude.
 * @param {number} lngIntIn An integer longitude.
 * @param {number=} codeLength The number of significant digits in the output
 *     code, not including any separator characters.
 * @return {string} A code of the specified length or the default length if not
 *     specified.
 * @throws {Error} if any of the input values are not numbers.
 */
export function encodeIntegers(latIntIn: number, lngIntIn: number, codeLength?: number): string {
  let latInt = latIntIn;
  let lngInt = lngIntIn;
  if (typeof codeLength === "undefined") {
    codeLength = CODE_PRECISION_NORMAL;
  } else {
    codeLength = Math.min(MAX_DIGIT_COUNT_, Number(codeLength));
  }
  if (Number.isNaN(latInt) || Number.isNaN(lngInt) || Number.isNaN(codeLength)) {
    throw new Error("ValueError: Parameters are not numbers");
  }
  if (codeLength < MIN_DIGIT_COUNT_ || (codeLength < PAIR_CODE_LENGTH_ && codeLength % 2 === 1)) {
    throw new Error("IllegalArgumentException: Invalid Open Location Code length");
  }
  // JavaScript strings are immutable and there isn't a native
  // StringBuilder, so we'll use an array.
  const code = new Array<string>(MAX_DIGIT_COUNT_ + 1);
  code[SEPARATOR_POSITION_] = SEPARATOR_;

  // Compute the grid part of the code if necessary.
  if (codeLength > PAIR_CODE_LENGTH_) {
    for (let i = MAX_DIGIT_COUNT_ - PAIR_CODE_LENGTH_; i >= 1; i--) {
      const latDigit = latInt % GRID_ROWS_;
      const lngDigit = lngInt % GRID_COLUMNS_;
      const ndx = latDigit * GRID_COLUMNS_ + lngDigit;
      code[SEPARATOR_POSITION_ + 2 + i] = CODE_ALPHABET_.charAt(ndx);
      latInt = Math.floor(latInt / GRID_ROWS_);
      lngInt = Math.floor(lngInt / GRID_COLUMNS_);
    }
  } else {
    latInt = Math.floor(latInt / GRID_ROWS_ ** GRID_CODE_LENGTH_);
    lngInt = Math.floor(lngInt / GRID_COLUMNS_ ** GRID_CODE_LENGTH_);
  }

  // Add the pair after the separator.
  code[SEPARATOR_POSITION_ + 1] = CODE_ALPHABET_.charAt(latInt % ENCODING_BASE_);
  code[SEPARATOR_POSITION_ + 2] = CODE_ALPHABET_.charAt(lngInt % ENCODING_BASE_);
  latInt = Math.floor(latInt / ENCODING_BASE_);
  lngInt = Math.floor(lngInt / ENCODING_BASE_);

  // Compute the pair section of the code.
  for (let j = PAIR_CODE_LENGTH_ / 2 + 1; j >= 0; j -= 2) {
    code[j] = CODE_ALPHABET_.charAt(latInt % ENCODING_BASE_);
    code[j + 1] = CODE_ALPHABET_.charAt(lngInt % ENCODING_BASE_);
    latInt = Math.floor(latInt / ENCODING_BASE_);
    lngInt = Math.floor(lngInt / ENCODING_BASE_);
  }

  // If we don't need to pad the code, return the requested section.
  if (codeLength >= SEPARATOR_POSITION_) {
    return code.slice(0, codeLength + 1).join("");
  }

  // Pad and return the code.
  return (
    code.slice(0, codeLength).join("") +
    Array(SEPARATOR_POSITION_ - codeLength + 1).join(PADDING_CHARACTER_) +
    SEPARATOR_
  );
}

/**
 * Decodes an Open Location Code into its location coordinates.
 *
 * Returns a CodeArea object that includes the coordinates of the bounding
 * box - the lower left, center and upper right.
 *
 * @param {string} code The code to decode.
 * @return {CodeArea} An object with the coordinates of the area of the code.
 * @throws {Error} If the code is not valid.
 */
export function decode(code: string): CodeArea {
  if (!isFull(code)) {
    throw new Error(`IllegalArgumentException: Passed Plus Code is not a valid full code: ${code}`);
  }
  // This calculates the values for the pair and grid section separately, using
  // integer arithmetic. Only at the final step are they converted to floating
  // point and combined.
  // Strip the '+' and '0' characters from the code and convert to upper-case.
  code = code.replace("+", "").replace(/0/g, "").toLocaleUpperCase("en-US");

  // Initialize the values for each section. We work them out as integers and
  // convert them to floats at the end.
  let normalLat = -LATITUDE_MAX_ * PAIR_PRECISION_;
  let normalLng = -LONGITUDE_MAX_ * PAIR_PRECISION_;
  let gridLat = 0;
  let gridLng = 0;
  // How many digits do we have to process?
  let digits = Math.min(code.length, PAIR_CODE_LENGTH_);
  // Define the place value for the most significant pair.
  let pv = PAIR_FIRST_PLACE_VALUE_;
  // Decode the paired digits.
  for (let i = 0; i < digits; i += 2) {
    normalLat += CODE_ALPHABET_.indexOf(code.charAt(i)) * pv;
    normalLng += CODE_ALPHABET_.indexOf(code.charAt(i + 1)) * pv;
    if (i < digits - 2) pv /= ENCODING_BASE_;
  }
  // Convert the place value to a float in degrees.
  let latPrecision = pv / PAIR_PRECISION_;
  let lngPrecision = pv / PAIR_PRECISION_;

  // Process any extra precision digits.
  if (code.length > PAIR_CODE_LENGTH_) {
    // Initialise the place values for the grid.
    let rowPv = GRID_LAT_FIRST_PLACE_VALUE_;
    let colPv = GRID_LNG_FIRST_PLACE_VALUE_;
    // How many digits do we have to process?
    digits = Math.min(code.length, MAX_DIGIT_COUNT_);
    for (let k = PAIR_CODE_LENGTH_; k < digits; k++) {
      const digitVal = CODE_ALPHABET_.indexOf(code.charAt(k));
      const row = Math.floor(digitVal / GRID_COLUMNS_);
      const col = digitVal % GRID_COLUMNS_;
      gridLat += row * rowPv;
      gridLng += col * colPv;
      if (k < digits - 1) {
        rowPv /= GRID_ROWS_;
        colPv /= GRID_COLUMNS_;
      }
    }

    // Adjust the precisions from the integer values to degrees.
    latPrecision = rowPv / FINAL_LAT_PRECISION_;
    lngPrecision = colPv / FINAL_LNG_PRECISION_;
  }

  // Merge the values from the normal and extra precision parts of the code.
  const lat = normalLat / PAIR_PRECISION_ + gridLat / FINAL_LAT_PRECISION_;
  const lng = normalLng / PAIR_PRECISION_ + gridLng / FINAL_LNG_PRECISION_;
  return new CodeArea(
    lat,
    lng,
    lat + latPrecision,
    lng + lngPrecision,
    Math.min(code.length, MAX_DIGIT_COUNT_),
  );
}

/**
 * Recover the nearest matching code to a specified location.
 *
 * Given a valid short Open Location Code this recovers the nearest matching
 * full code to the specified location.
 *
 * @param {string} shortCode A valid short code.
 * @param {number} referenceLatitude The latitude to use for the reference
 *     location.
 * @param {number} referenceLongitude The longitude to use for the reference
 *     location.
 * @return {string} The nearest matching full code to the reference location.
 * @throws {Error} if the short code is not valid, or the reference
 *     position values are not numbers.
 */
export function recoverNearest(
  shortCode: string,
  referenceLatitude: number,
  referenceLongitude: number,
): string {
  if (isFull(shortCode)) {
    return shortCode.toUpperCase();
  }
  if (!isShort(shortCode)) {
    throw new Error(`ValueError: Passed short code is not valid: ${shortCode}`);
  }

  referenceLatitude = Number(referenceLatitude);
  referenceLongitude = Number(referenceLongitude);
  if (Number.isNaN(referenceLatitude) || Number.isNaN(referenceLongitude)) {
    throw new Error("ValueError: Reference position are not numbers");
  }

  referenceLatitude = clipLatitude(referenceLatitude);
  referenceLongitude = normalizeLongitude(referenceLongitude);

  // Clean up the passed code.
  shortCode = shortCode.toUpperCase();
  // Compute the number of digits we need to recover.
  const paddingLength = SEPARATOR_POSITION_ - shortCode.indexOf(SEPARATOR_);
  // The resolution (height and width) of the padded area in degrees.
  const resolution = 20 ** (2 - paddingLength / 2);
  // Distance from the center to an edge (in degrees).
  const halfResolution = resolution / 2.0;

  // Use the reference location to pad the supplied short code and decode it.
  const codeArea = decode(
    encode(referenceLatitude, referenceLongitude).substring(0, paddingLength) + shortCode,
  );
  // How many degrees latitude is the code from the reference? If it is more
  // than half the resolution, we need to move it north or south but keep it
  // within -90 to 90 degrees.
  let latCenter = codeArea.latitudeCenter;
  let lngCenter = codeArea.longitudeCenter;
  if (referenceLatitude + halfResolution < latCenter && latCenter - resolution >= -LATITUDE_MAX_) {
    // If the proposed code is more than half a cell north of the reference location,
    // it's too far, and the best match will be one cell south.
    latCenter -= resolution;
  } else if (
    referenceLatitude - halfResolution > latCenter &&
    latCenter + resolution <= LATITUDE_MAX_
  ) {
    // If the proposed code is more than half a cell south of the reference location,
    // it's too far, and the best match will be one cell north.
    latCenter += resolution;
  }

  // How many degrees longitude is the code from the reference?
  if (referenceLongitude + halfResolution < lngCenter) {
    lngCenter -= resolution;
  } else if (referenceLongitude - halfResolution > lngCenter) {
    lngCenter += resolution;
  }

  return encode(latCenter, lngCenter, codeArea.codeLength);
}

/**
 * Remove characters from the start of an OLC code.
 *
 * This uses a reference location to determine how many initial characters
 * can be removed from the OLC code. The number of characters that can be
 * removed depends on the distance between the code center and the reference
 * location.
 *
 * @param {string} code The full code to shorten.
 * @param {number} latitude The latitude to use for the reference location.
 * @param {number} longitude The longitude to use for the reference location.
 * @return {string} The code, shortened as much as possible that it is still
 *     the closest matching code to the reference location.
 * @throws {Error} if the passed code is not a valid full code or the
 *     reference location values are not numbers.
 */
export function shorten(code: string, latitude: number, longitude: number): string {
  if (!isFull(code)) {
    throw new Error(`ValueError: Passed code is not valid and full: ${code}`);
  }
  if (code.indexOf(PADDING_CHARACTER_) !== -1) {
    throw new Error(`ValueError: Cannot shorten padded codes: ${code}`);
  }

  code = code.toUpperCase();
  const codeArea = decode(code);
  if (codeArea.codeLength < MIN_TRIMMABLE_CODE_LEN_) {
    throw new Error(`ValueError: Code length must be at least ${MIN_TRIMMABLE_CODE_LEN_}`);
  }

  // Ensure that latitude and longitude are valid.
  latitude = Number(latitude);
  longitude = Number(longitude);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("ValueError: Reference position are not numbers");
  }
  latitude = clipLatitude(latitude);
  longitude = normalizeLongitude(longitude);
  // How close are the latitude and longitude to the code center.
  const range = Math.max(
    Math.abs(codeArea.latitudeCenter - latitude),
    Math.abs(codeArea.longitudeCenter - longitude),
  );
  for (let i = PAIR_RESOLUTIONS_.length - 2; i >= 1; i--) {
    // Check if we're close enough to shorten. The range must be less than 1/2
    // the resolution to shorten completely, and we want to allow some safety, so
    // use 0.3 instead of 0.5 as a multiplier.
    if (range < PAIR_RESOLUTIONS_[i] * 0.3) {
      return code.substring((i + 1) * 2);
    }
  }
  return code;
}

/**
 * Clip a latitude into the range -90 to 90.
 *
 * @param {number} latitude
 * @return {number} The latitude value clipped to be in the range.
 */
export function clipLatitude(latitude: number): number {
  return Math.min(90, Math.max(-90, latitude));
}

/**
 * Normalize a longitude into the range -180 to 180, not including 180.
 *
 * @param {number} longitude
 * @return {number} Normalized into the range -180 to 180.
 */
export function normalizeLongitude(longitude: number): number {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

export const OpenLocationCode = {
  CODE_PRECISION_NORMAL,
  CODE_PRECISION_EXTRA,
  getAlphabet,
  isValid,
  isShort,
  isFull,
  encode,
  decode,
  recoverNearest,
  shorten,
};
