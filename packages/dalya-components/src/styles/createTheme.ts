import {
  createTheme as systemCreateTheme,
  Theme as SystemTheme,
  ThemeOptions as SystemThemeOptions,
} from 'dalya-system';
import { DalyaError } from 'dalya-utils';

import { Mixins, MixinsOptions } from './createMixins';
import { Palette, PaletteOptions, createPalette } from './createPalette';
import { Components } from './components';

export interface ThemeOptions extends Omit<SystemThemeOptions, 'zIndex'> {
  mixins?: MixinsOptions;
  palette?: PaletteOptions;
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

  ///
}
