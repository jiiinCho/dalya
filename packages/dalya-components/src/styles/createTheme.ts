import {
  createTheme as systemCreateTheme,
  Theme as SystemTheme,
  ThemeOptions as SystemThemeOptions,
} from 'dalya-system';
import { DalyaError, deepmerge, stateClasses, generateUtilityClass } from 'dalya-utils';

import createMixins, { Mixins, MixinsOptions } from './createMixins';
import { Palette, PaletteOptions, createPalette } from './createPalette';
import createTypography, {
  Typography,
  TypographyOptions,
  TypographyOptionCallback,
} from './createTypography';
import { shadows, Shadows } from './shadow';
import createTransitions, { Transitions, TransitionsOptions } from './createTransitions';
import { ZIndexOptions, ZIndex, zIndex } from './zIndex';

import { Components } from './components';

// TODO: JIN check why Omit<SystemThemeOptions, 'zIndex'> is needed
interface ThemeOptions extends SystemThemeOptions {
  mixins?: MixinsOptions;
  components?: Components<Omit<Theme, 'components'>>;
  palette?: PaletteOptions;
  shadow?: Shadows;
  transitions?: TransitionsOptions;
  typography?: TypographyOptions | TypographyOptionCallback;
  zIndex?: ZIndexOptions;
  unstable_strictMode?: boolean;
}

interface BaseTheme extends Omit<SystemTheme, 'mixins'> {
  mixins: Mixins;
  palette: Palette;
  shadows: Shadows;
  transitions: Transitions;
  typography: Typography;
  zIndex: ZIndex;
  unstable_strictMode?: boolean;
}

// disable automatic exports for `BaseTheme` interface definition
/*
When a TypeScript file is compiled to JavaScript, any top-level variables or functions defined in the file are automatically exported by default. This means that they can be imported and used by other modules in your application.

The BaseTheme interface is defined at the top of the file, and export {}; is used to prevent it from being exported automatically. This means that other modules in your application cannot import or use BaseTheme directly. Instead, it must be explicitly exported from the module where it is defined.
*/
export {};

/*
 Refer to MUI's how to add custom properties: [TypeScript guide on theme customization](https://mui.com/material-ui/guides/typescript/#customization-of-theme)
 */
export interface Theme extends BaseTheme {
  components?: Components<BaseTheme>;
}

// TODO: JIN, why ...args needed? it got loosely typed
function createTheme(options: ThemeOptions = {}, ...args: object[]): Theme {
  if ((options as any).vars) {
    throw new DalyaError(
      'Dalya: `vars` is a private field used for CSS variables support.\n' +
        'Please use another name',
    );
  }

  const {
    breakpoints: breakpointsInput,
    mixins: mixinsInput = {},
    palette: paletteInput = {},
    transitions: transitionsInput = {},
    typography: typographyInput = {},
    // shape: shapeInput, // TODO: JIN - not applied, check in Jest
    // spacing: spacingInput, // TODO: JIN - not applied, check in Jest
    ...other
  } = options;

  const palette = createPalette(paletteInput);
  const systemTheme = systemCreateTheme(options);

  const themeGenerator = () => {
    let theme: any;

    theme = deepmerge(systemTheme, {
      mixins: createMixins(systemTheme.breakpoints, mixinsInput),
      palette,
      // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol
      shadows: shadows.slice(),
      typography: createTypography({ palette, typography: typographyInput }),
      transitions: createTransitions(transitionsInput),
      zIndex: { ...zIndex },
    });

    theme = deepmerge(theme, other);
    theme = args.reduce((acc, argument) => deepmerge(acc, argument), theme);

    return theme as Theme;
  };

  const dalyaTheme = themeGenerator();

  const traverse = (node: Record<keyof any, any>, component: keyof Components<BaseTheme>) => {
    if (process.env.NODE_ENV !== 'productions') {
      Object.keys(node).forEach((key) => {
        const child = node[key];
        if (stateClasses.indexOf(key as any) !== -1 && Object.keys(child).length > 0) {
          if (process.env.NODE_ENV !== 'production') {
            const stateClass = generateUtilityClass('', key);
            console.error(
              [
                `MUI: The \`${component}\` component increases ` +
                  `the CSS specificity of the \`${key}\` internal state.`,
                'You can not override it like this: ',
                JSON.stringify(node, null, 2),
                '',
                `Instead, you need to use the '&.${stateClass}' syntax:`,
                JSON.stringify(
                  {
                    root: {
                      [`&.${stateClass}`]: child,
                    },
                  },
                  null,
                  2,
                ),
                '',
                'https://mui.com/r/state-classes-guide',
              ].join('\n'),
            );
          }
        }
      });

      // Remove the style to prevent global conflicts
      node[component] = {};
    }
  };

  if (dalyaTheme.components) {
    const dalyaComponents = dalyaTheme.components;

    Object.keys(dalyaComponents).forEach((componentKey) => {
      const dalyaComponentKey = componentKey as keyof Components<BaseTheme>;
      const dalyaComponent = dalyaComponents[dalyaComponentKey];
      const styleOverrides = dalyaComponent?.styleOverrides;

      if (styleOverrides && dalyaComponentKey.indexOf('Dalya') === 0) {
        traverse(styleOverrides, dalyaComponentKey);
      }
    });
  }

  return dalyaTheme;
}

export default createTheme;
