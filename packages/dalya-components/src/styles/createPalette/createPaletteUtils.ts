import { getContrastRatio, lighten, darken } from 'dalya-system';
import { DalyaError } from 'dalya-utils';

import { ColorNames, colorNames } from 'dalya-components';
import { dark, light, getDefaultColor } from 'dalya-components/colors';
import {
  SimplePaletteColorOptions,
  PaletteAugmentColorOptions,
  PaletteColor,
  PaletteOptions,
} from './createPaletteTypes';

export function isColorNames(name: any): name is ColorNames {
  return colorNames.includes(name);
}

/**
 * Returns default theme text color based on given contrastThreshold and print error message if given background color could not meet WCAG minimum contrast ratio (3)
 * @param {string} background - Text background color
 * @param {number} contrastThreshold - Contrast ratio to validate text color
 * @returns Default theme text color
 */
function getContrastText(background: string, contrastThreshold = 3) {
  // dark.text.primary = common.white, light.text.primary = rgba(0, 0, 0, 0.87)
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

function isSimplePaletteColorOptions(colorOptions: any): colorOptions is SimplePaletteColorOptions {
  return colorOptions.main || colorOptions.light || colorOptions.dark;
}

type AugmentColorConfig = {
  tonalOffsetLight: number;
  tonalOffsetDark: number;
  contrastThreshold: number;
};

function internalGetAugmentColor(augmentColorConfig: AugmentColorConfig) {
  const { tonalOffsetLight, tonalOffsetDark, contrastThreshold } = augmentColorConfig;
  const generateAugmentColor = (baseColor: SimplePaletteColorOptions) => {
    return {
      main: baseColor.main,
      light: baseColor.light || lighten(baseColor.main, tonalOffsetLight),
      dark: baseColor.dark || darken(baseColor.main, tonalOffsetDark),
      contrastText: getContrastText(baseColor.main, contrastThreshold),
    };
  };

  return (baseColor: SimplePaletteColorOptions) => generateAugmentColor(baseColor);
}

// augment - additional functionality or extention
// assign default color.main, color.light, color.dark and color.contrastText
export function augmentColor({
  color,
  name,
  mainShade = 500,
  lightShade = 300,
  darkShade = 700,
  tonalOffset = 0.2,
  contrastThreshold = 3,
}: PaletteAugmentColorOptions): PaletteColor {
  const tonalOffsetLight = tonalOffset.light || tonalOffset;
  const tonalOffsetDark = tonalOffset.dark || tonalOffset * 1.5;

  const getAugmentColor = internalGetAugmentColor({
    contrastThreshold,
    tonalOffsetDark,
    tonalOffsetLight,
  });

  if (isSimplePaletteColorOptions(color)) {
    // Error handling in case no typescript support
    if (!color.main) {
      throw new DalyaError(
        'Dalya: The color (%s) provided to augmentColor(color) is invalid. The color object needs to have color.main or color[%s] value',
        name,
        String(mainShade),
      );
    }

    // Error handling in case no typescript support
    if (typeof color.main !== 'string') {
      throw new DalyaError(
        'Dalya: The color (%s) provided to augmentColor(color) is invalid. color.main should be a string type, but {%s} was provided instead',
        name,
        JSON.stringify(color.main),
      );
    }

    return getAugmentColor({
      main: color.main,
      light: color.light,
      dark: color.dark,
    });
  }

  const colorMain = color[mainShade];
  if (!colorMain) {
    throw new DalyaError(
      'Dalya: The color (%s) provided to augmentColor(color) is invalid. The color object needs to have color.main or color[%s] value',
      name,
      String(mainShade),
    );
  }

  return getAugmentColor({
    main: colorMain,
    light: color[lightShade],
    dark: color[darkShade],
  });
}

function safeAugmentColor(options: PaletteAugmentColorOptions): PaletteColor | null {
  try {
    return augmentColor(options);
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error?.stack || error);
    }

    return null;
  }
}

type DefaultAugmentPaletteColorOptions = Omit<PaletteAugmentColorOptions, 'color' | 'name'> & {
  color?: PaletteAugmentColorOptions['color'];
  name: ColorNames;
};

type CustomAugmentPaletteColorOptions = Omit<PaletteAugmentColorOptions, 'color'> & {
  color?: PaletteAugmentColorOptions['color'];
};

// getPaletteColor will assign default palette color in cases:
// - if there is no overwrite in ColorNames (primary, secondary..)
// - missing 'main' field, which will log error
function getPaletteColor(paletteColorConfig: PaletteOptions) {
  const { mode, contrastThreshold } = paletteColorConfig;

  function privateAssignDefaultPaletteColor(colorName: ColorNames) {
    const defaultPaletteColor = getDefaultColor(colorName, mode);
    const contrastText = getContrastText(defaultPaletteColor.main, contrastThreshold);

    return { ...defaultPaletteColor, contrastText };
  }
  function internalGetDefaultAugmentPaletteColor(options: DefaultAugmentPaletteColorOptions) {
    const customColor = paletteColorConfig[options.name];
    if (!customColor) {
      return privateAssignDefaultPaletteColor(options.name);
    }

    const safeAugementColorOptions = { ...paletteColorConfig, ...options, color: customColor };
    const customColorWithShades = safeAugmentColor(safeAugementColorOptions);

    return customColorWithShades || privateAssignDefaultPaletteColor(options.name);
  }

  function internalGetCustomAugmentPaletteColor(options: CustomAugmentPaletteColorOptions) {
    const colorName = options.name;
    const customColor = paletteColorConfig.customColors?.find(
      (customColorObject) => customColorObject[colorName],
    );

    if (!customColor) {
      console.error(
        'Dalya: Could not find color name `%s`. Assign color values in createPalette(options.customColors)',
        colorName,
      );

      return null;
    }

    const safeAugementColorOptions = {
      ...paletteColorConfig,
      ...options,
      color: customColor[colorName],
    };

    return safeAugmentColor(safeAugementColorOptions);
  }

  const paletteAugmentColorHandler = {
    paletteColorConfig,
    internalGetDefaultAugmentPaletteColor,
    internalGetCustomAugmentPaletteColor,
  };

  const getDefaultAugmentPaletteColor =
    paletteAugmentColorHandler.internalGetDefaultAugmentPaletteColor.bind(
      paletteAugmentColorHandler,
    );

  const getCustomAugmentPaletteColor =
    paletteAugmentColorHandler.internalGetCustomAugmentPaletteColor.bind(
      paletteAugmentColorHandler,
    );

  return {
    getDefaultAugmentPaletteColor,
    getCustomAugmentPaletteColor,
  };
}

const createPaletteUtils = (paletteOptions: PaletteOptions) => {
  const { contrastThreshold, tonalOffset } = paletteOptions;

  const defaultGetContrastText = (background: string) =>
    getContrastText(background, contrastThreshold);

  const defaultGetPaletteColor = (palette: PaletteOptions) =>
    getPaletteColor({ ...paletteOptions, ...palette });

  const defaultSafeAugmentColor = (paletteAugmentColorOptions: PaletteAugmentColorOptions) =>
    safeAugmentColor({ ...paletteAugmentColorOptions, contrastThreshold, tonalOffset });

  return {
    getContrastText: defaultGetContrastText,
    getPaletteColor: defaultGetPaletteColor,
    safeAugmentColor: defaultSafeAugmentColor,
  };
};
export default createPaletteUtils;
