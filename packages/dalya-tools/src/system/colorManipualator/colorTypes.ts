// After making the namesArr array into readonly mode, you cannot use the usual push, pop, slice, etc.
const SupportedColorFormat = ['rgb', 'rgba', 'hsl', 'hsla', 'color'] as const;
const SupportedColorSpace = ['srgb', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec-2020'] as const;
export type ColorFormat = typeof SupportedColorFormat[number];
export type ColorSpace = typeof SupportedColorSpace[number];

export interface ColorObject {
  type: ColorFormat;
  values: [number, number, number] | [number, number, number, number];
  colorSpace?: ColorSpace;
}

export function isValidColorFormat(format: any): format is ColorFormat {
  return SupportedColorFormat.includes(format);
}

export function isValidColorSpace(colorSpace: any): colorSpace is ColorFormat {
  return SupportedColorSpace.includes(colorSpace);
}

export function isColorObject(color: any): color is ColorObject {
  return color.type && color.values;
}
