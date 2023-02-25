import { deepmerge } from 'dalya-utils';

import createBreakpoints, { Breakpoints, BreakpointsOptions } from './createBreakpoints';
import createSpacing, { Spacing, SpacingOptions } from './createSpacing';
import { shape, Shape, ShapeOptions } from './shape';

export type Direction = 'ltr' | 'rtl'; // left to right | right to left

export interface ThemeOptions {
  shape?: ShapeOptions;
  breakpoints?: BreakpointsOptions;
  direction?: Direction;
  mixins?: unknown;
  palette?: Record<string, any>;
  shadows?: unknown;
  spacing?: SpacingOptions;
  transitions?: unknown;
  components?: Record<string, any>;
  typography?: unknown;
  zIndex?: Record<string, number>;
}

export interface Theme {
  shape: Shape;
  breakpoints: Breakpoints;
  direction: Direction;
  spacing: Spacing;
  // below types will be defined in consumer, i.e. dalya-compoennts -> createTheme.ts
  components?: Record<string, any>;
  mixins?: unknown;
  palette: Record<string, any> & { mode: 'light' | 'dark' };
  shadows?: unknown;
  transitions?: unknown;
  typography?: unknown;
  zIndex?: unknown;
}

function createTheme(options: ThemeOptions = {}, ...args: object[]): Theme {
  const {
    breakpoints: breakpointsInput = {},
    palette: paletteInput = {},
    spacing: spacingInput,
    shape: shapeInput = {},
    ...other
  } = options;

  const breakpoints = createBreakpoints(breakpointsInput);
  const spacing = createSpacing(spacingInput);

  let dalyaTheme: Theme = deepmerge(
    {
      breakpoints,
      direction: 'ltr',
      components: {}, // Inject component definitions
      palette: { mode: 'light', ...paletteInput },
      spacing,
      shape: { ...shape, ...shapeInput },
    },
    other,
  );

  dalyaTheme = args.reduce((acc, argument) => deepmerge(acc, argument), dalyaTheme) as Theme;

  return dalyaTheme;
}

export default createTheme;
