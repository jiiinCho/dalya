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
  return Object.prototype.hasOwnProperty.call(colorOptions, 'main');
}

type AugmentColorConfig = {
  tonalOffsetLight: number;
  tonalOffsetDark: number;
  contrastThreshold: number;
};

function internalGetAugmentColor(augmentColorConfig: AugmentColorConfig) {
  const augmentColorHandler = {
    augmentColorConfig,
    generateAugmentColor(baseColor: {
      main: string;
      light: string | undefined;
      dark: string | undefined;
    }) {
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
function augmentColor({
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
    // this exception is for the use case without typescript support
    if (!color.main) {
      throw new DalyaError(
        'Dalya: Color object in augmentColor({color}) should have `main` property. Error in color name: %s',
        String(name),
      );
    }

    // this exception is for the use case without typescript support
    if (typeof color.main !== 'string') {
      throw new DalyaError(
        'Dalya: Typeof color.main in augmentColor({color}) should be a string, but got type `%s`',
        JSON.stringify(color.main),
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
      'Dalya: Color object in augmentColor({color}) should have `%s` property. Error in color name: %s',
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
    if (process.env.NODE_ENV !== 'production') {
      console.error(error?.stack || error);
    }

    return null;
  }
}

// assign default palette color in case wrong palette color input
function getPaletteColor(paletteColorConfig: PaletteOptions) {
  function internalAssignDefaultPaletteColor(colorName: ColorNames, paletteConfig: PaletteOptions) {
    const { mode, contrastThreshold } = paletteConfig;

    const defaultPaletteColor = getDefaultColor(colorName, mode);
    const contrastText = getContrastText(defaultPaletteColor.main, contrastThreshold);

    return { ...defaultPaletteColor, contrastText };
  }

  function getAugmentPaletteColor(
    this: { paletteColorConfig: PaletteOptions },
    options: Omit<PaletteAugmentColorOptions, 'color'> &
      Partial<Pick<PaletteAugmentColorOptions, 'color'>>,
  ) {
    const customColor = this.paletteColorConfig[options.name];
    if (!customColor) {
      return internalAssignDefaultPaletteColor(options.name, this.paletteColorConfig);
    }

    const safeAugementColorOptions = { ...this.paletteColorConfig, ...options, color: customColor };
    const customColorWithShades = safeAugmentColor(safeAugementColorOptions);

    return (
      customColorWithShades ||
      internalAssignDefaultPaletteColor(options.name, this.paletteColorConfig)
    );
  }

  const paletteAugmentColorHandler = { paletteColorConfig, getAugmentPaletteColor };

  return paletteAugmentColorHandler.getAugmentPaletteColor.bind(paletteAugmentColorHandler);
}

const createPaletteUtils = {
  getContrastText,
  getPaletteColor,
  safeAugmentColor,
};
export default createPaletteUtils;
