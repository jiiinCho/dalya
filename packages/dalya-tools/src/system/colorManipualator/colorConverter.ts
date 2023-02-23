import { DalyaError } from 'dalya-utils';

import {
  clamp,
  unifyToSixDigits,
  colorObjectGenerator,
  privateConvertHexToRgb,
  intToHex,
} from './colorUtils';
import {
  ColorObject,
  ColorFormat,
  ColorSpace,
  isColorObject,
  isValidColorFormat,
  isValidColorSpace,
} from './colorTypes';

/**
 * Converts a color from CSS hex format to CSS rgb format, i.e. #0080C0 to (0, 128, 192)
 * @param {string} color - Hex color, i.e. #RGB or #RRGGBB, #RRGGBBAA
 * @returns {string} A CSS rgb color string
 */
export function hexToRgb(color: string): string {
  if (!color.startsWith('#')) {
    throw new DalyaError(
      'Dalya: Unsupported hex format. Should start with #(hash symbol) but got %s',
      color,
    );
  }
  const colorValuesRaw = color.slice(1); // colorValues = 0080C0
  const rgbForamt = `rgb${colorValuesRaw.length > 6 ? 'a' : ''}`; // rgb or rgba
  const unifiedHexValuesInArray = unifyToSixDigits(colorValuesRaw);

  if (!unifiedHexValuesInArray) {
    if (process.env.NODE_ENV !== 'production') {
      throw new DalyaError(
        'Dalya: Unsuppported hex input./nIt should be either three, six digits or eight digits but got %s',
        color,
      );
    }
    return color;
  }

  const rgbValue = privateConvertHexToRgb(unifiedHexValuesInArray);
  return `${rgbForamt}(${rgbValue})`;
}

/**
 * Converts a color object with type and values to a string
 * @param {ColorObject} color - Decomposed color
 * @returns {string} - CSS color string
 */
export function recomposeColor(color: ColorObject): string {
  const { type, values, colorSpace } = color;

  function getCSS4ColorValues(css4ColorValues: ColorObject['values']) {
    return css4ColorValues
      .map((value, index) => {
        if (index >= 3) {
          return `/${value}`;
        }
        return value;
      })
      .join(' ');
  }

  switch (type) {
    case 'rgb':
    case 'rgba':
      return `${type}(${values.map((n, i) => (i < 3 ? Math.trunc(n) : n)).join(', ')})`;
    case 'hsl':
    case 'hsla':
      return `${type}(${values.map((n, i) => (i > 0 && i < 3 ? `${n}%` : n)).join(', ')})`;
    case 'color':
      return `${type}(${colorSpace} ${getCSS4ColorValues(values)})`;
    default:
      throw new DalyaError('Dalya: Unsupported color type %s. Could not recomposed color', type);
  }
}

/**
 * Returns an object with type and values of a color
 * Note: Does not support rgb% values
 * @param color - CSS color, i.e. #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @returns - color object
 */
export function decomposeColor(color: string | ColorObject): ColorObject {
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
      'Dalya: Unsupported CSS color %s. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().',
      color,
    );
  }

  const colorFormat = isCSSColor[1].toString(); // rgba
  if (!isValidColorFormat(colorFormat)) {
    throw new DalyaError(
      'Dalya: Unsupported color format %s. The following formats are supported: rgb, rgba, hsl, hsla, and color',
      colorFormat,
    );
  }

  const colorValue = isCSSColor[2].toString(); // "255, 255, 255, 100"

  // i.e. color(display-p3 0.5 0.3 0.2 /0.4)
  if (colorFormat === 'color') {
    const cssColorValuesInString = colorValue.split(' '); // ['display-3', '0.5', '0.3', '0.2', '/0.4']
    const colorSpace = cssColorValuesInString.splice(0, 1).toString(); // display-p3
    if (!isValidColorSpace(colorSpace)) {
      throw new DalyaError(
        'Dalya: Does not support %s color space. The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020',
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
 * Converts rgb color to hex color
 * @param {string} color - RGB color, i.e rgb(r, g, b)
 * @returns {string} hex color i.e. #rrggbbaa
 */
export function rgbToHex(color: string): string {
  // Idempotent
  if (color.startsWith('#')) {
    return color;
  }

  const { values } = decomposeColor(color);
  const hexColorValues = values
    .map((value, index) => intToHex(index === 3 ? Math.round(255 * value) : value))
    .join('');

  return `#${hexColorValues}`;
}

/**
 * Converts a color from hsl format to rgb format
 * @param {string} color - HSL color values
 * @returns {string} rgb color values
 */
export function hslToRgb(color: string): string {
  const { type, values } = decomposeColor(color);
  const hue = values[0];
  const saturation = values[1] / 100;
  const lightness = values[2] / 100;
  const area = saturation * Math.min(lightness, 1 - lightness);
  const factor = (n: number, k = (n + hue / 30) % 12) =>
    lightness - area * Math.max(Math.min(k - 3, 9 - k, 1), -1);

  const rgb = [
    Math.round(factor(0) * 255),
    Math.round(factor(8) * 255),
    Math.round(factor(4) * 255),
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
export function getLuminance(color: string) {
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

export function darken(color: string, coefficient: number): string {
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

export function lighten(color: string, coefficient: number): string {
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
      throw new DalyaError(`Dalya: Unsupported color type ${type}`);
  }

  return recomposeColor({ type, values: colorValues, colorSpace });
}

/**
 * Sets the absolute transparency of a color. Any existing alpha values are overwritten.
 * @param {string} color - CSS color, i.e.  CSS color, i.e. #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @param {number} value - Value to set alpha channel, in the range between 0 to 1
 * @returns {string} A CSS color string.Hex input values are returned as rgb
 */
export function alpha(color: string, value: number): string {
  const { type, values, colorSpace } = decomposeColor(color);
  const alphaFactor = clamp(value);

  let alphaColorType = type;
  const alphaColorValues = values;

  if (type === 'rgb' || type === 'hsl') {
    alphaColorType += 'a';
  }

  alphaColorValues[3] = alphaFactor;

  return recomposeColor({
    type: alphaColorType as ColorFormat,
    values: alphaColorValues,
    colorSpace,
  });
}

/**
 * Darken or lighten a color depending on its luminance. Light colors are darkend, dark colors are lightend
 * @param {string} color - CSS color, i.e.  CSS color, i.e. #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @param {number} coefficient - intensity, default value is 0.15. Value requires to be in range from zero to one
 * @returns {string} CSS color string. Hex input values are returned as rgb
 */
export function emphasize(color: string, coefficient = 0.15): string {
  return getLuminance(color) > 0.5 ? darken(color, coefficient) : lighten(color, coefficient);
}

/**
 * Returns only color values exclude alpha values
 * @param {string} color - CSS color, i.e.  CSS color, i.e. #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 */
export function colorChannel(color: string): string {
  const { type, values } = decomposeColor(color);
  const channel = values
    .slice(0, 3)
    .map((value, index) => {
      if (type.indexOf('hsl') !== -1 && index !== 0) {
        // hsl or hsla
        return `${value}%`;
      }
      return value;
    })
    .join(' ');

  return channel;
}
