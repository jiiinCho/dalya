import CSS from 'csstype';
import { Breakpoints } from 'dalya-system';

export type NormalCSSProperties = CSS.Properties<number | string>;
export type FontFace = CSS.AtRule.FontFace & { fallbacks?: CSS.AtRule.FontFace[] };

/**
 * Allows user to augment (add) properties
 */
export interface BaseCSSProperties extends NormalCSSProperties {
  '@font-face'?: FontFace | FontFace[];
}

export interface CSSProperties extends BaseCSSProperties {
  // Allow pseudo selectors (::before, ::after) and media queries
  // `unknown` is used since TS does not allow assigning an interface without an index signiture to one with an index signiture.
  // This is to allow type safe module argumentation.
  // Technically we want any key not typed in `BaseCSSProperties` to be of type `CSSProperties` but this doesn't work.
  // The index signature needs to cover BaseCSSProperties as well. Usually you would use `BaseCSSProperties[keyof BaseCSSPropertes]` but this would not allow assigning React.CSSProperties to CSSPropperties
  [key: string]: unknown | CSSProperties;
}

export interface Mixins {
  toolbar: CSSProperties;
  // use interface declaration merging to add custom mixins
}

export interface MixinsOptions extends Partial<Mixins> {
  // use interface declaration merging to add custom mixin options
}

function createMixins(breakpoints: Breakpoints, mixins: MixinsOptions): Mixins {
  return {
    toolbar: {
      minHeight: 56,
      [breakpoints.up('xs')]: {
        '@media (orientation: landscape)': {
          minHeight: 48,
        },
      },
      [breakpoints.up('sm')]: {
        minHeight: 64,
      },
    },
    ...mixins,
  };
}

export default createMixins;
