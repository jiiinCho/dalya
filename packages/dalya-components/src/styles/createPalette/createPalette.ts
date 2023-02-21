import { deepmerge } from 'dalya-utils';
import { common, dark, grey, light } from 'dalya-components/colors';

import { Palette, PaletteOptions } from './createPaletteTypes';
import createPaletteUtils from './createPaletteUtils';

/**
 * Returns palette object with default color values
 * - primary, secondary, error, info, success, warning are augmented color - color with main, light and dark properties
 * - whereas common and grey are not augmented color
 * @param {PaletteOptions} palette - Color object to assign custom color values
 * @returns {Palette} - Default color palette such as primary, secondary, error etc
 */
function createPalette(palette: PaletteOptions): Palette {
  const { mode = 'light', contrastThreshold = 3, tonalOffset = 0.2, ...other } = palette;

  const modes = { dark, light };
  if (process.env.NODE_ENV !== 'production') {
    if (!modes[mode]) {
      console.error(`Dalya: The palette mode \`${mode}\` is not supported.`);
    }
  }

  const { getPaletteColor, getContrastText, safeAugmentColor } = createPaletteUtils;

  const getAugmentPaletteColor = getPaletteColor(palette);

  const paletteTargetObject = {
    // A collection of common colors
    common: { ...common }, // prevent mutable object
    // either light or dark
    mode,
    // The colors used to represent primary interface elements
    primary: getAugmentPaletteColor({ name: 'primary' }),
    // The colors used to represent secondary interface elements
    secondary: getAugmentPaletteColor({
      name: 'secondary',
      mainShade: 'A400',
      lightShade: 'A200',
      darkShade: 'A700',
    }),
    // The colors used to represent interface elements that the user should be aware of
    error: getAugmentPaletteColor({ name: 'error' }),
    // The colors used to represent potentially dangerous actions or important messages
    warning: getAugmentPaletteColor({ name: 'warning' }),
    // The colors used to represent information to the user that is neutral and not necessarily important
    info: getAugmentPaletteColor({ name: 'info' }),
    // The colors used to indicate the successful completion of an action that user triggered
    success: getAugmentPaletteColor({ name: 'success' }),
    // The grey colors
    grey,
    // Used by `getContrastText()` to maximize the contrast between background and text. Default is 3 (Web Content Accessibility Guidelines standard)
    contrastThreshold,
    // Takes a background color and returns text color that maximize the contrast
    getContrastText,
    // Generates a rich color object. Returns null for missing `main` field or non string color value
    augmentColor: safeAugmentColor,
    // Tonal colours are different shades of colours in the same main colour group
    // Shift a color's luminance by approximately two indexes within its tonal palette
    // - E.g., tonalOffset 0.2 means shift from Red 500 to Red 300 or Red 700
    // number between 0 to 1 or can be object, i.e. { light: 0.2, dark: 0.4 }
    tonalOffset,
    // Th light and dark mode object
    ...modes[mode],
  };

  return deepmerge(paletteTargetObject, other);
}

export default createPalette;
