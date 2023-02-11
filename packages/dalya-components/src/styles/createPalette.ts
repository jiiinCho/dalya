import { CommonColors, Color, PaletteMode } from '..';
import {
  blue,
  purple,
  red,
  lightBlue,
  orange,
  green,
  dark,
  light,
  TypeTextColor,
  TypeTextColorOptions,
} from '../colors';

type ColorPartial = Partial<Color>;
type PaletteColorOptions = SimplePaletteColorOptions | ColorPartial;

interface SimplePaletteColorOptions {
  light?: string;
  main: string;
  dark?: string;
  contrastText?: string;
}

interface PaletteColor {
  light: string;
  main: string;
  dark: string;
  contrastText: string;
}

type PaletteTonalOffset = number | { light: number; dark: number };

interface PaletteAugmentColorOptions {
  color: PaletteColorOptions;
  mainShade?: number | string;
  lightShade?: number | string;
  darkShade?: number | string;
  name?: number | string;
}

export interface PaletteOptions extends TypeTextColorOptions {
  common?: Partial<CommonColors>;
  mode?: PaletteMode;
  contrastThreshold?: number;
  tonalOffset?: PaletteTonalOffset;
  primary?: PaletteColorOptions;
  secondary?: PaletteColor;
  error?: PaletteColor;
  warning?: PaletteColor;
  info?: PaletteColor;
  success?: PaletteColor;
  grey?: Color;
  getContrastText?: (background: string) => string;
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
  getContrastText: (background: string) => string;
  augmentColor: (options: PaletteAugmentColorOptions) => PaletteColor;
}

function getDefaultPrimary(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: blue[200],
      lihgt: blue[50],
      dark: blue[400],
    };
  }

  return {
    main: blue[700],
    lihgt: blue[400],
    dark: blue[800],
  };
}

function getDefaultSecondary(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: purple[200],
      lihgt: purple[50],
      dark: purple[400],
    };
  }

  return {
    main: purple[500],
    lihgt: purple[300],
    dark: purple[700],
  };
}

function getDefaultError(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: red[500],
      lihgt: red[300],
      dark: red[700],
    };
  }

  return {
    main: red[700],
    lihgt: red[400],
    dark: red[800],
  };
}

function getDefaultInfo(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: lightBlue[400],
      lihgt: lightBlue[300],
      dark: lightBlue[700],
    };
  }

  return {
    main: lightBlue[700],
    lihgt: lightBlue[500],
    dark: lightBlue[900],
  };
}

function getDefaultSuccess(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: green[400],
      lihgt: green[300],
      dark: green[700],
    };
  }

  return {
    main: green[800],
    lihgt: green[500],
    dark: green[900],
  };
}

function getDefaultWarning(mode = 'light') {
  if (mode === 'dark') {
    return {
      main: orange[400],
      lihgt: orange[300],
      dark: orange[700],
    };
  }

  return {
    main: orange[800],
    lihgt: orange[500],
    dark: orange[900],
  };
}

function getContrastText(
  background: Palette['background'],
  contrastThreshold: Palette['contrastThreshold'],
) {
  const contrastText =
    getContrastRatio(background, dark.text.primary) >= contrastThreshold
      ? dark.text.primary
      : light.text.primary;

  if (process.env.NODE_ENV !== 'production') {
    const contrast = getContrastRatio(background, contrastText);
    if (contrast < 3) {
      console.error(
        [
          `Dalya: The contrast ratio of ${contrast}: 1 for ${contrastText} on ${background}`,
          'falls below the WCAG recommneded absolute minimum contrast ratio of 3:1.',
          'https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast',
        ].join('\n'),
      );
    }
  }

  return contrastText;
}

function createPalette(palette: PaletteOptions): Palette {
  const { mode = 'light', contrastThreshold = 3, tonalOffset = 0.2, ...other } = palette;

  const primary = palette.primary || getDefaultPrimary(mode);
  const secondary = palette.secondary || getDefaultSecondary(mode);
  const error = palette.error || getDefaultError(mode);
  const info = palette.info || getDefaultInfo(mode);
  const success = palette.success || getDefaultSuccess(mode);
  const warning = palette.warning || getDefaultWarning(mode);
}
export default createPalette;
