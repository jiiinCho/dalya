import DalyaError from 'dalya-utils/macros/DalyaError.macro';

// After making the namesArr array into readonly mode, you cannot use the usual push, pop, slice, etc.
const SupportedColorFormat = ['rgb', 'rgba', 'hsl', 'hsla', 'color'] as const;
const SupportedColorSpace = ['srgb', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec-2020'] as const;
type ColorFormat = typeof SupportedColorFormat[number];
type ColorSpace = typeof SupportedColorSpace[number];
interface ColorObject {
  type: ColorFormat;
  values: [number, number, number] | [number, number, number, number];
  colorSpace?: ColorSpace;
}

function isValidColorFormat(format: any): format is ColorFormat {
  return SupportedColorFormat.includes(format);
}

function isValidColorSpace(colorSpace: any): colorSpace is ColorFormat {
  return SupportedColorSpace.includes(colorSpace);
}

/**
 * Unify format to six hex digits
 * @param hexValue - #RGB or #RRGGBB, #RRGGBBAA
 * @returns - ['RR', 'GG', 'BB'], ['RR', 'GG', 'BB', 'AA'] or null in wrong format
 */
function unifyToSixDigits(hexValue: string): string[] | null {
  // /.{1,2}/g => group string by spliting 2 units
  // i.e. 'hello'.match(/.{1, 2}/g) => ['he', 'll', 'o']
  const regExForStringPairs = new RegExp(`.{1,${hexValue.length >= 6 ? 2 : 1}}`, 'g');
  const pairedColorValues = hexValue.match(regExForStringPairs);

  if (!pairedColorValues) {
    return null;
  }

  // case: #000
  if (pairedColorValues[0].length === 1) {
    return pairedColorValues.map((n) => n + n);
  }

  return pairedColorValues;
}

/**
 * Convert hexadecimal to decimal
 * @param hexValues - `['RR', 'GG', 'BB']` or `['RR', 'GG', 'BB', 'AA']`
 * @returns - `(RR, GG, BB, AA)`
 */
function convertHexToRgb(hexValues: string[]): string {
  // alpha should be convert from hexadecimal to percentage
  const alpha = hexValues
    .splice(3)
    .map((alphaValue) => Math.round((parseInt(alphaValue, 16) / 255) * 1000) / 1000); // mutate param
  const hexToDecimal = hexValues.map((hex) => parseInt(hex, 16));

  return [...hexToDecimal, ...alpha].join(', ');
}

/**
 * Converts a color from CSS hex format to CSS rgb format, i.e. #0080C0 to (0, 128, 192)
 * @param {string} color - Hex color, i.e. #RGB or #RRGGBB, #RRGGBBAA
 * @returns {string} A CSS rgb color string
 */
function hexToRgb(color: string): string {
  const colorValuesRaw = color.slice(1); // colorValues = 0080C0
  const rgbForamt = `rgb${colorValuesRaw.length > 6 ? 'a' : ''}`; // rgb or rgba
  const unifiedHexValuesInArray = unifyToSixDigits(colorValuesRaw);

  if (!unifiedHexValuesInArray) {
    if (process.env.NODE_ENV !== 'production') {
      throw new DalyaError(`Dalya: Unsuppported hex input.`, color);
    }
    return ''; // won't display correct color
  }

  const rgbValue = convertHexToRgb(unifiedHexValuesInArray);
  return `${rgbForamt}${rgbValue}`;
}

function isColorObject(color: any): color is ColorObject {
  return color.type && color.values;
}

type ColorObjectGeneratorPrarams = {
  type: ColorFormat;
  values: number[];
  colorSpace?: ColorSpace;
};

// utility function for decomposeColor()
function colorObjectGenerator(color: ColorObjectGeneratorPrarams): {
  color: ColorObjectGeneratorPrarams;
  getColorObject: () => ColorObject;
} {
  return {
    color,
    getColorObject(): ColorObject {
      if (this.color.values.includes(NaN)) {
        const NaNIndex = this.color.values.indexOf(NaN);
        throw new DalyaError(
          'Dalya: Unsupported color values. Given color type `%s` includes value `%s`. This should be number type',
          this.color.type,
          this.color.values[NaNIndex],
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
 * Returns an object with type and values of a color
 * Note: Does not support rgb% values
 * @param color - CSS color, i.e. #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @returns - color object
 */
function decomposeColor(color: string | ColorObject): ColorObject {
  // Idempotent:
  if (isColorObject(color)) {
    return color;
  }

  // hex code
  if (color.charAt(0) === '#') {
    return decomposeColor(hexToRgb(color));
  }

  const isCSSColor = color.match(/(.*(?=))\((.*)\)/);
  if (!isCSSColor) {
    throw new DalyaError(
      'Dalya: Unsupported `$s` color.\n' +
        'The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().',
      color,
    );
  }

  const colorFormat = isCSSColor[1].toString(); // rgba
  const colorValue = isCSSColor[2].toString(); // "255, 255, 255, 100"

  if (!isValidColorFormat(colorFormat)) {
    throw new DalyaError(
      'Dalya: Unsupported `$s` color.\n' +
        'The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().',
      color,
    );
  }

  // i.e. color(display-p3 0.5 0.3 0.2 /0.4)
  if (colorFormat === 'color') {
    const cssColorValuesInString = colorValue.split(' '); // ['display-3', '0.5', '0.3', '0.2', '/0.4']
    const colorSpace = cssColorValuesInString.splice(0, 1).toString(); // display-p3
    if (!isValidColorSpace(colorSpace)) {
      throw new DalyaError(
        'Dalya: Does not support rgb% values.' +
          'The following spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020',
        colorSpace,
      );
    }

    const cssColorValues = cssColorValuesInString.map((cssColorValue: string) => {
      const parsedInFloat = parseFloat(cssColorValue);
      // case: '/0.4'
      if (Number.isNaN(parsedInFloat)) {
        return parseFloat(cssColorValue.replace('/', ''));
      }
      return parsedInFloat;
    }); // [0.5, 0.3, 0.2, 0.4]

    return colorObjectGenerator({
      type: colorFormat as ColorFormat,
      values: cssColorValues,
      colorSpace: colorSpace as ColorSpace,
    }).getColorObject();
  }

  return colorObjectGenerator({
    type: colorFormat as ColorFormat,
    values: colorValue.split(',').map((value: string) => parseFloat(value)),
  }).getColorObject();
}

/**
 * Converts a color object with type and values to a string
 * @param {ColorObject} color - Decomposed color
 * @returns {string} - CSS color string
 */
export function recomposeColor(color: ColorObject): string {
  const { type, values, colorSpace } = color;

  switch (type) {
    case 'rgb':
    case 'rgba':
      return `${type}(${values.map((n, i) => (i < 3 ? Math.round(n) : n)).join(', ')})`;
      break;
    case 'hsl':
    case 'hsla':
      return `${type}(${values.map((n, i) => (i > 0 && i < 3 ? `${n}%` : n)).join(', ')})`;
    case 'color':
      return `${colorSpace} ${values.join(' ')}`;
    default:
      throw new DalyaError('Dalya: Unsupported type `%s`. Could not recomposed color', type);
  }
}

/**
 * Converts a color from hsl format to rgb format
 * @param {string} color - HSL color values
 * @returns {string} rgb color values
 */
function hslToRgb(color: string): string {
  const { type, values } = decomposeColor(color);
  const hue = values[0];
  const saturation = values[1] / 100;
  const lightness = values[2] / 100;
  const area = saturation * Math.min(lightness, 1 - lightness);
  const scaler = (n: number, k = (n + hue / 30) % 12) =>
    lightness - area * Math.max(Math.min(k - 3, 9 - k, 1) - 1);

  const rgb = [
    Math.round(scaler(0) * 255),
    Math.round(scaler(8) * 255),
    Math.round(scaler(4) * 255),
  ] as [number, number, number];

  let rgbType = 'rgb';

  if (type === 'hsla' && values[3]) {
    rgbType += 'a';
    rgb.push(values[3]);
  }

  return recomposeColor({ type: rgbType as ColorFormat, values: rgb });
}

/**
 * Relative brightness of any point in a color space,
 * @param {string} color - CSS color, i.e. #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @returns {number} relative brightness of the color in the range 0 - 1
 */
function getLuminance(color: string) {
  const { type, values } = decomposeColor(color);

  let rgb = values as number[];
  if (['hsl', 'hsla'].includes(type)) {
    rgb = decomposeColor(hslToRgb(color)).values;
  }

  rgb = rgb.map((value) => {
    let colorValue = value;
    if (type !== 'color') {
      colorValue /= 255; // normalized to 0 for darkest black and 1 for lightest white
    }
    return colorValue <= 0.04045 ? colorValue / 12.92 : ((colorValue + 0.055) / 1.055) ** 2.4;
  });

  // Truncate at 3 digits
  return Number((0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(3));
}

/**
 * Calculates contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
 * @param {string} foreground - CSS color, i.e. #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @param {string} background - CSS color, i.e. #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @returns {number} A contrast ratio value in the range 0 - 21
 */
export function getContrastRatio(foreground: string, background: string) {
  const lumA = getLuminance(foreground);
  const lumB = getLuminance(background);
  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}

/**
 * To limit value doesn't go below a minimum or above a maximum
 * @param {number} value - value to be clamped
 * @param {number} min  - lower boundary of the output range
 * @param {number} max - upper boundary of the output range
 * @returns {number} A number in the range [min, max]
 */
function clamp(value: number, min = 0, max = 1): number {
  if (process.env.NODE_ENV !== 'production') {
    if (value < min || value > max) {
      console.error(`Dalya: The value provided ${value} is out of range [${min}, ${max}].`);
    }
  }
  return Math.min(Math.max(min, value), max);
}

function darken(color: string, coefficient: number): string {
  const { type, values, colorSpace } = decomposeColor(color);
  const factor = clamp(coefficient);

  let colorValues = values;

  if (type.indexOf('hsl') !== -1) {
    // hsl or hsla
    colorValues[2] *= 1 - factor;
  } else {
    colorValues = colorValues.map((colorValue, index) => {
      if (index < 3) {
        colorValue *= 1 - factor;
      }
      return colorValue;
    }) as typeof values;
  }

  return recomposeColor({ type, values: colorValues, colorSpace });
}

// Error handler for darken function, thrown exceptions from decomposeColor would be caught here
// usage example: safeDarken(palette.error.light, 0.6)
export function safeDarken(color: string, coefficient: number, warning: string) {
  try {
    return darken(color, coefficient);
  } catch (error) {
    if (warning && process.env.NODE_ENV !== 'productions') {
      console.warn(warning);
      // TODO: why not this one?
      // console.warn(error);
    }
    return color;
  }
}

function lighten(color: string, coefficient: number): string {
  const { type, values, colorSpace } = decomposeColor(color);
  const factor = clamp(coefficient);

  let colorValues = values;
  switch (type) {
    case 'hsl':
    case 'hsla':
      colorValues[2] += (100 - colorValues[2]) * factor;
      break;
    case 'rgb':
    case 'rgba':
      colorValues = colorValues.map((colorValue, index) => {
        if (index < 3) {
          colorValue += (255 - colorValue) * factor;
        }
        return colorValue;
      }) as typeof values;
      break;
    case 'color':
      colorValues = colorValues.map((colorValue, index) => {
        if (index < 3) {
          colorValue += (1 - colorValue) * factor;
        }
        return colorValue;
      }) as typeof values;
      break;
    default:
      throw new DalyaError('Dalya: Unsupported color type `%s`', type);
  }

  return recomposeColor({ type, values: colorValues, colorSpace });
}

/**
 * Lighten a color
 * @param {string} color - CSS color, CSS color, i.e. #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @param {number} coefficient - multiplier in the range 0 - 1
 * @param {string} warning - (optional) custom console error message for development environemnt
 * @returns {string} A CSS color string. Hex input values are returned as rgb
 */
export function safeLighten(color: string, coefficient: number, warning: string): string {
  try {
    return lighten(color, coefficient);
  } catch (error) {
    if (warning && process.env.NODE_ENV !== 'production') {
      console.warn(warning);
      console.warn(error); // why not?
    }
    return color;
  }
}
