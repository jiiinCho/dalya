import { getContrastRatio, lighten, darken } from 'dalya-system';
import { DalyaError } from 'dalya-utils';

import { ColorNames } from 'dalya-components';
import { dark, light, getDefaultColor } from 'dalya-components/colors';
import {
  SimplePaletteColorOptions,
  PaletteAugmentColorOptions,
  PaletteColor,
  PaletteOptions,
} from './createPaletteTypes';

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
  const augmentColorHandler = {
    augmentColorConfig,
    generateAugmentColor(baseColor: SimplePaletteColorOptions) {
      const { tonalOffsetLight, tonalOffsetDark, contrastThreshold } = this.augmentColorConfig;
      return {
        main: baseColor.main,
        light: baseColor.light || lighten(baseColor.main, tonalOffsetLight),
        dark: baseColor.dark || darken(baseColor.main, tonalOffsetDark),
        contrastText: getContrastText(baseColor.main, contrastThreshold),
      };
    },
  };

  return augmentColorHandler.generateAugmentColor.bind(augmentColorHandler);
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
        'Dalya: Color object in augmentColor({color}) should have color.main value. Error in color name: %s',
        String(name),
      );
    }

    // Error handling in case no typescript support
    if (typeof color.main !== 'string') {
      throw new DalyaError(
        'Dalya: color.main in augmentColor({color}) should be string type, but got %s type',
        String(typeof color.main),
      );
    }

    return getAugmentColor({
      main: color.main,
      light: color.light,
      dark: color.dark,
    });
  }

  const colorPartialMain = color[mainShade];
  if (!colorPartialMain) {
    throw new DalyaError(
      'Dalya: Color object in augmentColor({color}) should have color[%s] value. Error in color name: %s',
      String(mainShade),
      String(name),
    );
  }

  return getAugmentColor({
    main: colorPartialMain,
    light: color[lightShade],
    dark: color[darkShade],
  });
}

function safeAugmentColor(options: PaletteAugmentColorOptions): PaletteColor | null {
  try {
    return augmentColor(options);
  } catch (error: any) {
    console.log('cannot be happen here');
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

interface AugmentedPaletteGenerator {
  paletteColorConfig: PaletteOptions;
  internalGetDefaultAugmentPaletteColor: (
    options: DefaultAugmentPaletteColorOptions,
  ) => PaletteColor;
  // TODO: remove in case no use
  internalGetCustomAugmentPaletteColor: (
    options: CustomAugmentPaletteColorOptions,
  ) => PaletteColor | null;
}

// getPaletteColor will assign default palette color in cases:
// - if there is no overwrite in ColorNames (primary, secondary..)
// - missing 'main' field, it will console.error
function getPaletteColor(paletteColorConfig: PaletteOptions) {
  function privateAssignDefaultPaletteColor(colorName: ColorNames, paletteConfig: PaletteOptions) {
    const { mode, contrastThreshold } = paletteConfig;

    const defaultPaletteColor = getDefaultColor(colorName, mode);
    const contrastText = getContrastText(defaultPaletteColor.main, contrastThreshold);

    return { ...defaultPaletteColor, contrastText };
  }

  function internalGetDefaultAugmentPaletteColor(
    this: AugmentedPaletteGenerator,
    options: DefaultAugmentPaletteColorOptions,
  ) {
    const customColor = this.paletteColorConfig[options.name];
    if (!customColor) {
      return privateAssignDefaultPaletteColor(options.name, this.paletteColorConfig);
    }

    const safeAugementColorOptions = { ...this.paletteColorConfig, ...options, color: customColor };
    const customColorWithShades = safeAugmentColor(safeAugementColorOptions);

    return (
      customColorWithShades ||
      privateAssignDefaultPaletteColor(options.name, this.paletteColorConfig)
    );
  }

  function internalGetCustomAugmentPaletteColor(
    this: AugmentedPaletteGenerator,
    options: CustomAugmentPaletteColorOptions,
  ) {
    const colorName = options.name;
    const customColor = this.paletteColorConfig.customColors?.find(
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
      ...this.paletteColorConfig,
      ...options,
      color: customColor,
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

const createPaletteUtils = {
  getContrastText,
  getPaletteColor,
  safeAugmentColor,
};
export default createPaletteUtils;
