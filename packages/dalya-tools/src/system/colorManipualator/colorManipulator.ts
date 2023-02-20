import { recomposeColor, hexToRgb, darken, lighten } from './colorConverter';

import { ColorObject } from './colorTypes';

function privateSafeOnError(error: any, warning?: string) {
  if (warning) {
    console.warn(warning);
  }
  console.error(error?.stack || error);
}

export function safeRecomposeColor(color: ColorObject, warning?: string): string | null {
  try {
    return recomposeColor(color);
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      privateSafeOnError(error, warning);
    }
    return null; // TODO: Not sure?
  }
}

// Error handler for darken function, thrown exceptions from decomposeColor would be caught here
// usage example: safeDarken(palette.error.light, 0.6)
export function safeDarken(color: string, coefficient: number, warning?: string) {
  try {
    return darken(color, coefficient);
  } catch (error) {
    if (process.env.NODE_ENV !== 'productions') {
      privateSafeOnError(error, warning);
    }
    return color;
  }
}

/**
 * Lighten a color
 * @param {string} color - CSS color, CSS color, i.e. #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @param {number} coefficient - multiplier in the range 0 - 1
 * @param {string} warning - (optional) custom console error message for development environemnt
 * @returns {string} A CSS color string. Hex input values are returned as rgb
 */
export function safeLighten(color: string, coefficient: number, warning?: string): string {
  try {
    return lighten(color, coefficient);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      privateSafeOnError(error, warning);
    }
    return color;
  }
}

export function safeHexToRgb(color: string, warning?: string): string {
  try {
    return hexToRgb(color);
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      privateSafeOnError(error, warning);
    }
    return color;
  }
}
