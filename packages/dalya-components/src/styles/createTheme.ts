import {
  createTheme as systemCreateTheme,
  Theme as SystemTheme,
  ThemeOptions as SystemThemeOptions,
} from 'dalya-system';
import { DalyaError, deepmerge } from 'dalya-utils';

import createMixins, { Mixins, MixinsOptions } from './createMixins';
import { Palette, PaletteOptions, createPalette } from './createPalette';
import createTypography from './createTypography';
import { shadows } from './shadow';
import createTransitions, { Transitions, TransitionsOptions } from './createTransitions';

import { Components } from './components';


// TODO
export interface ThemeOptions extends Omit<SystemThemeOptions, 'zIndex'> {
  mixins?: MixinsOptions;
  components?: Components<Omit<Theme, 'components'>>;
  palette?: PaletteOptions;
  shadow?: Shadows;
}

interface BaseTheme extends SystemTheme {
  mixins: Mixins;
  palette: Palette;
}

export interface Theme extends BaseTheme {
  components?: Components<BaseTheme>;
}

function createTheme(options: ThemeOptions = {}, ...args: object[]): Theme {
  const {
    breakpoints: breakpointsInput,
    mixins: mixinsInput = {},
    spacing: spacingInput,
    palette: paletteInput = {},
    transitions: transitionsInput = {},
    typography: typographyInput = {},
    shape: shapeInput = {},
    ...other
  } = options;

  if ((options as any).vars) {
    throw new DalyaError(
      'Dalya: `vars` is a private field used for CSS variables support.\n' +
        'Please use another name',
    );
  }

  const palette = createPalette(paletteInput);
  const systemTheme = systemCreateTheme(options);

  let dalyaTheme = deepmerge(systemTheme, {
    mixins: createMixins(systemTheme.breakpoints, mixinsInput),
    palette,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol
    shadows: shadows.slice(),
    typography: createTypography(palette, typographyInput),
    transitions: createTransitions(transitionsInput),
    zIndex: { ...zIndex },
  });

  dalyaTheme = deepmerge(dalyaTheme, other);
  dalyaTheme = args.reduce((acc, argument) => deepmerge(acc, argument), dalyaTheme);

  if (process.env.NODE_ENV !== 'productions') {
    const traverse = (node, component) => {
      Object.keys(node).forEach((key) => {
        const child = node[key];
        if(stateClasses.indexOf(key) !== -1 && Object.keys(child).length > 0) {
          if(process.env.NODE_ENV !== 'production') {
            const stateClass = 
          }
        }
      })
    }
  }
}
