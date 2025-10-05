/** A separator used to break the code into two parts to aid memorability. */
export const SEPARATOR_ = "+";

/** The number of characters to place before the separator. */
export const SEPARATOR_POSITION_ = 8;

/** The character used to pad codes. */
export const PADDING_CHARACTER_ = "0";

/** The character set used to encode the values. */
export const CODE_ALPHABET_ = "23456789CFGHJMPQRVWX";

/** The base to use to convert numbers to/from. */
export const ENCODING_BASE_ = CODE_ALPHABET_.length;

/** The maximum value for latitude in degrees. */
export const LATITUDE_MAX_ = 90;

/** The maximum value for longitude in degrees. */
export const LONGITUDE_MAX_ = 180;

/** The min number of digits in a Plus Code. */
export const MIN_DIGIT_COUNT_ = 2;

/** The max number of digits to process in a Plus Code. */
export const MAX_DIGIT_COUNT_ = 15;

/**
 * Maximum code length using lat/lng pair encoding. The area of such a code is
 * approximately 13x13 meters (at the equator), and should be suitable for
 * identifying buildings. This excludes prefix and separator characters.
 */
export const PAIR_CODE_LENGTH_ = 10;

/** First place value of the pairs (if the last pair value is 1). */
export const PAIR_FIRST_PLACE_VALUE_ = ENCODING_BASE_ ** (PAIR_CODE_LENGTH_ / 2 - 1);

/** Inverse of the precision of the pair section of the code. */
export const PAIR_PRECISION_ = ENCODING_BASE_ ** 3;

/**
 * The resolution values in degrees for each position in the lat/lng pair encoding. These give the place value of each
 * position, and therefore the dimensions of the resulting area.
 */
export const PAIR_RESOLUTIONS_ = [20.0, 1.0, 0.05, 0.0025, 0.000125];

/** Number of digits in the grid precision part of the code. */
export const GRID_CODE_LENGTH_ = MAX_DIGIT_COUNT_ - PAIR_CODE_LENGTH_;

/** Number of columns in the grid refinement method. */
export const GRID_COLUMNS_ = 4;

/** Number of rows in the grid refinement method. */
export const GRID_ROWS_ = 5;

/** First place value of the latitude grid (if the last place is 1). */
export const GRID_LAT_FIRST_PLACE_VALUE_ = GRID_ROWS_ ** (GRID_CODE_LENGTH_ - 1);

/** First place value of the longitude grid (if the last place is 1). */
export const GRID_LNG_FIRST_PLACE_VALUE_ = GRID_COLUMNS_ ** (GRID_CODE_LENGTH_ - 1);

/** Multiply latitude by this much to make it a multiple of the finest precision. */
export const FINAL_LAT_PRECISION_ =
  PAIR_PRECISION_ * GRID_ROWS_ ** (MAX_DIGIT_COUNT_ - PAIR_CODE_LENGTH_);

/** Multiply longitude by this much to make it a multiple of the finest precision. */
export const FINAL_LNG_PRECISION_ =
  PAIR_PRECISION_ * GRID_COLUMNS_ ** (MAX_DIGIT_COUNT_ - PAIR_CODE_LENGTH_);

/** Minimum length of a code that can be shortened. */
export const MIN_TRIMMABLE_CODE_LEN_ = 6;

/** Provides a normal precision code, approximately 14x14 meters. */
export const CODE_PRECISION_NORMAL = 10;

/** Provides an extra precision code, approximately 2x3 meters. */
export const CODE_PRECISION_EXTRA = 11;
