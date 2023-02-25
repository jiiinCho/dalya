import React from 'react';
import CSS from 'csstype';
import { deepmerge } from 'dalya-utils';

import { createPalette, Palette } from './createPalette';

export type Variant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline';

interface FontStyle
  extends Required<{
    fontFamily: React.CSSProperties['fontFamily'];
    fontSize: number;
    fontWeightLight: React.CSSProperties['fontWeight'];
    fontWeightRegular: React.CSSProperties['fontWeight'];
    fontWeightMedium: React.CSSProperties['fontWeight'];
    fontWeightBold: React.CSSProperties['fontWeight'];
    htmlFontSize: number;
  }> {}

type NormalCssProperties = CSS.Properties<number | string>;
type FontFace = CSS.AtRule.FontFace & { fallbacks?: CSS.AtRule.FontFace[] };

interface BaseCSSProperties extends NormalCssProperties {
  '@font-face'?: FontFace | FontFace[];
}

interface CSSProperties extends BaseCSSProperties {
  // Allow pseudo selectors and media queries
  // `unknown`is used since TS does not allow assigning an interface without
  // an index signature to one with an index signature.
  // This is to allow type safe module augmentation.
  // Technically we want any key not typed in `BaseCSSProperties` to be of type
  // `CSSProperties` but this doesn't work. The index signature needs to cover
  // BaseCSSProperties as well. Usually you would use `BaseCSSProperties[keyof BaseCSSProperties]`
  // but this would not allow asigning React.CSSProperties to CSSProperties
  [key: string]: unknown | CSSProperties;
}

interface FontStyleOptions extends Partial<FontStyle> {
  allVariants?: React.CSSProperties;
}

// TODO: which one should actually be allowed to be subject to module augmentation?
// current type vs interface decision is kept for historical reasons until we
// made a decision
type TypographyStyle = CSSProperties;
interface TypographyStyleOptions extends TypographyStyle {}

interface TypographyUtils {
  pxToRem: (px: number) => string;
}

export interface Typography extends Record<Variant, TypographyStyle>, FontStyle, TypographyUtils {}

export interface TypographyOptions
  extends Partial<Record<Variant, TypographyStyleOptions> & FontStyleOptions & TypographyUtils> {}

function round(value: number) {
  return Math.round(value * 1e5) / 1e5; // 1e5 equals 1*100000
}

const caseAllCaps = {
  'text-transform': 'uppercase',
};

const defaultFontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';

const defaultPalette = createPalette({});

/**
 * @see @link{https://m2.material.io/design/typography/the-type-system.html}
 * @see @link{https://m2.material.io/design/typography/understanding-typography.html}
 */
type TypographyOptionCallback = (palette: Palette) => TypographyOptions;
interface CreateTypographyParams {
  palette?: Palette;
  typography?: TypographyOptions | TypographyOptionCallback;
}
function createTypography(params: CreateTypographyParams): Typography {
  const { palette, typography } = params;
  const typographyParams = palette || defaultPalette;

  const {
    fontFamily = defaultFontFamily,
    // default font size of Material Specification
    fontSize = 14, // px
    fontWeightLight = 300,
    fontWeightRegular = 400,
    fontWeightMedium = 500,
    fontWeightBold = 700,
    // Tell Dalya what's the font-size on html element
    htmlFontSize = 16, // px, default font-size used by browsers
    // Apply CSS properties to all the variants
    allVariants,
    pxToRem: customPxToRem,
    ...other
  } = typeof typography === 'function' ? typography(typographyParams) : typography || {};

  if (process.env.NODE_ENV !== 'production') {
    if (typeof fontSize !== 'number') {
      console.error('Dalya: `fontSize` is required to be number type');
    }

    if (typeof htmlFontSize !== 'number') {
      console.error('Dalya: `htmlFontSize` is required to be number type');
    }
  }

  const coefficient = fontSize / 14;
  // MUI use rem for default typo unit?
  const convertPxToRem =
    customPxToRem || ((size: number) => `${(size / htmlFontSize) * coefficient}rem`);

  const buildVariant = (
    fontWeight: React.CSSProperties['fontWeight'],
    size: number,
    lineHeight: CSS.Properties['lineHeight'],
    letterSpacing: number,
    casing?: typeof caseAllCaps,
  ) => ({
    fontFamily,
    fontWeight,
    fontSize: convertPxToRem(size),
    // Unitless : https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    // raw number, which is used by descendent elements as a scaling factor (a multiplier)
    lineHeight,
    // The letter spacing was designed for the Roboto font-family. Using same letter-spacing
    // for all font-families can cause issues with the kerning
    ...(fontFamily === defaultFontFamily
      ? { letterSpacing: `${round(letterSpacing / size)}em` }
      : {}),
    ...casing,
    ...allVariants,
  });

  const variants: Record<Variant, TypographyStyle> = {
    h1: buildVariant(fontWeightLight, 96, 1.167, -1.5),
    h2: buildVariant(fontWeightLight, 60, 1.2, -0.5),
    h3: buildVariant(fontWeightRegular, 48, 1.167, 0),
    h4: buildVariant(fontWeightRegular, 34, 1.235, 0.25),
    h5: buildVariant(fontWeightRegular, 24, 1.334, 0),
    h6: buildVariant(fontWeightMedium, 20, 1.6, 0.15),
    subtitle1: buildVariant(fontWeightRegular, 16, 1.75, 0.15),
    subtitle2: buildVariant(fontWeightMedium, 14, 1.57, 0.1),
    body1: buildVariant(fontWeightRegular, 16, 1.5, 0.15),
    body2: buildVariant(fontWeightRegular, 14, 1.43, 0.15),
    button: buildVariant(fontWeightMedium, 14, 1.75, 0.4, caseAllCaps),
    caption: buildVariant(fontWeightRegular, 12, 1.66, 0.4),
    overline: buildVariant(fontWeightRegular, 12, 2.66, 1, caseAllCaps),
  };

  return deepmerge(
    {
      fontFamily,
      fontSize,
      fontWeightLight,
      fontWeightRegular,
      fontWeightMedium,
      fontWeightBold,
      htmlFontSize,
      pxToRem: convertPxToRem,
      ...variants,
    },
    other,
    { clone: false },
  );
}

export default createTypography;
