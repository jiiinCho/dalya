import { CommonColors, Color, PaletteMode, ColorNames } from 'dalya-components';
import { TypeTextColor, TypeTextColorOptions } from 'dalya-components/colors';

type ColorPartial = Partial<Color>;
type PaletteColorOptions = SimplePaletteColorOptions | ColorPartial;

export interface SimplePaletteColorOptions {
  light?: string;
  main: string;
  dark?: string;
  contrastText?: string;
}

export interface PaletteColor {
  light: string;
  main: string;
  dark: string;
  contrastText: string;
}

type PaletteTonalOffset = number | { light: number; dark: number };

export interface PaletteAugmentColorOptions {
  color: PaletteColorOptions;
  mainShade?: keyof Color;
  lightShade?: keyof Color;
  darkShade?: keyof Color;
  name: string;
  tonalOffset?: any;
  contrastThreshold?: number;
}

type PaletteColors = Record<ColorNames, PaletteColorOptions>;
type PaletteCustomColors = Record<string, PaletteColorOptions>;
export interface PaletteOptions extends TypeTextColorOptions, Partial<PaletteColors> {
  common?: Partial<CommonColors>;
  mode?: PaletteMode;
  contrastThreshold?: number;
  tonalOffset?: PaletteTonalOffset;
  grey?: Color;
  getContrastText?: (background: string, contrastThreshold?: number) => string;
  // consumer can assign additional colors
  customColors?: PaletteCustomColors[];
}

export interface Palette extends TypeTextColor {
  common: CommonColors;
  mode: PaletteMode;
  contrastThreshold: number;
  tonalOffset: PaletteTonalOffset;
  primary: PaletteColor;
  secondary: PaletteColor;
  error: PaletteColor;
  warning: PaletteColor;
  info: PaletteColor;
  success: PaletteColor;
  grey: Color;
  getContrastText: (background: string, contrastThreshold?: number) => string;
  augmentColor: (options: PaletteAugmentColorOptions) => PaletteColor | null;
}
