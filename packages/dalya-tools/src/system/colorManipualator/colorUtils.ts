import { DalyaError } from 'dalya-utils';

import { ColorObject, ColorFormat, ColorSpace } from './colorTypes';

/**
 * To limit value doesn't go below a minimum or above a maximum
 * @param {number} value - value to be clamped
 * @param {number} min  - lower boundary of the output range
 * @param {number} max - upper boundary of the output range
 * @returns {number} A number in the range [min, max]
 */
export function clamp(value: number, min = 0, max = 1): number {
  if (process.env.NODE_ENV !== 'production') {
    if (value < min || value > max) {
      throw new DalyaError(
        'Dalya: The value provided %s is out of range [%s, %s]',
        String(value),
        String(min),
        String(max),
      );
    }
  }
  return Math.min(Math.max(min, value), max);
}

/**
 * Unify format to six hex digits
 * @param hexValue - #RGB or #RRGGBB, #RRGGBBAA
 * @returns - ['RR', 'GG', 'BB'], ['RR', 'GG', 'BB', 'AA'] or null in wrong format
 */
export function unifyToSixDigits(hexValue: string): string[] | null {
  const hexFormat = [3, 6, 8].includes(hexValue.length);

  if (!hexFormat) {
    return null;
  }

  // /.{1,2}/g => group string by spliting 2 units
  // i.e. 'hello'.match(/.{1, 2}/g) => ['he', 'll', 'o']
  const regExForStringPairs = new RegExp(`.{1,${hexValue.length >= 6 ? 2 : 1}}`, 'g');
  const pairedColorValues = hexValue.match(regExForStringPairs);
  // ['0', '1','2'], ['00', '11', '22',] ['00', '11', '22', '33']
  if (!pairedColorValues) {
    return null;
  }

  // case: #000
  if (pairedColorValues[0].length === 1) {
    return pairedColorValues.map((n) => n + n);
  }

  return pairedColorValues;
}

type ColorObjectGeneratorPrarams = {
  type: ColorFormat;
  values: number[];
  colorSpace?: ColorSpace;
};
// utility function for decomposeColor()
export function colorObjectGenerator(color: ColorObjectGeneratorPrarams): {
  color: ColorObjectGeneratorPrarams;
  getColorObject: () => ColorObject;
} {
  return {
    color,
    getColorObject(): ColorObject {
      if (this.color.values.includes(NaN)) {
        throw new DalyaError(
          'Dalya: Unsupported color values. Given color type %s includes NaN values. Color values should be number type',
          this.color.type,
        );
      }

      const formattedValues: ColorObject['values'] = [
        this.color.values[0],
        this.color.values[1],
        this.color.values[2],
      ];

      if (this.color.values[3]) {
        formattedValues.push(this.color.values[3]);
      }

      return {
        type: this.color.type,
        values: formattedValues,
        ...(this.color.colorSpace && { colorSpace: this.color.colorSpace }),
      };
    },
  };
}

/**
 * Convert hexadecimal to decimal
 * @param hexValues - `['RR', 'GG', 'BB']` or `['RR', 'GG', 'BB', 'AA']`
 * @returns - `(RR, GG, BB, AA)`
 */
export function privateConvertHexToRgb(hexValues: string[]): string {
  // alpha should be convert from hexadecimal to percentage
  const alpha = hexValues
    .splice(3, 4)
    .map((alphaValue) => Math.round((parseInt(alphaValue, 16) / 255) * 1000) / 1000); // mutate param

  const hexToDecimal = hexValues.map((hex) => parseInt(hex, 16));

  return [...hexToDecimal, ...alpha].join(', ');
}

export function intToHex(int: number) {
  let hex = '0';

  if (int < 256) {
    hex = Math.abs(int).toString(16);
  }

  return hex.length === 1 ? `0${hex}` : hex;
}
