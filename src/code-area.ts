import { LATITUDE_MAX_, LONGITUDE_MAX_ } from "./constants";

/**
 * Coordinates of a decoded Open Location Code.
 * Type describing a decoded code area.
 */
export class CodeArea {
  /**
   * The latitude of the SW corner.
   * @type {number}
   */
  public readonly latitudeLo: number;

  /**
   * The longitude of the SW corner in degrees.
   * @type {number}
   */
  public readonly longitudeLo: number;

  /**
   * The latitude of the NE corner in degrees.
   * @type {number}
   */
  public readonly latitudeHi: number;

  /**
   * The longitude of the NE corner in degrees.
   * @type {number}
   */
  public readonly longitudeHi: number;

  /**
   * The number of digits in the code.
   * @type {number}
   */
  public readonly codeLength: number;

  /**
   * The latitude of the center in degrees.
   * @type {number}
   */
  public get latitudeCenter(): number {
    return Math.min(this.latitudeLo + (this.latitudeHi - this.latitudeLo) / 2, LATITUDE_MAX_);
  }

  /**
   * The longitude of the center in degrees.
   * @type {number}
   */
  public get longitudeCenter(): number {
    return Math.min(this.longitudeLo + (this.longitudeHi - this.longitudeLo) / 2, LONGITUDE_MAX_);
  }

  /**
   * The coordinates include the latitude and longitude of the lower left and
   * upper right corners and the center of the bounding box for the area the
   * code represents.
   * @param {number} latitudeLo
   * @param {number} longitudeLo
   * @param {number} latitudeHi
   * @param {number} longitudeHi
   * @param {number} codeLength
   */
  constructor(
    latitudeLo: number,
    longitudeLo: number,
    latitudeHi: number,
    longitudeHi: number,
    codeLength: number,
  ) {
    this.latitudeLo = latitudeLo;
    this.longitudeLo = longitudeLo;
    this.latitudeHi = latitudeHi;
    this.longitudeHi = longitudeHi;
    this.codeLength = codeLength;
  }
}
