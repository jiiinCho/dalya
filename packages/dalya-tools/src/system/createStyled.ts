import { ElementType } from 'react';

import {
  styled as styledEngineStyled,
  CSSInterpolation,
  CreateDalyaStyled as CreateDalyaStyledStyledEngine,
} from 'dalya-styled-engine';
import { getDisplayName } from 'dalya-utils';
import propsToClassKey from './propsToClassKey';

import { Theme as DefaultTheme, createTheme } from './createTheme';

export interface DalyaStyledOptions {
  name?: string;
  slot?: string;
  // Interpolation - supports functions based on props
  // If we want to support props in the overrides, we will need to change CSSInterpolation to Interpolation<Props>
  overridesResolver?: (props: any, styles: Record<string, CSSInterpolation>) => CSSInterpolation;
  skipVariantsResolver?: boolean;
}

export interface DalyaStyledCommonProps<Theme extends object = DefaultTheme> {
  theme?: Theme;
  as?: ElementType;
}

export type CreateDalyaStyled<T extends object = DefaultTheme> = CreateDalyaStyledStyledEngine<
  DalyaStyledCommonProps<T>,
  DalyaStyledOptions,
  T
>;

function isEmpty(obj: any): boolean {
  return Object.keys(obj).length === 0;
}

function isStringTag(tag: ElementType): boolean {
  return (
    typeof tag === 'string' &&
    // 96 is one less than the char code
    // for "a" so this is checking that
    // it's a lowercase character
    tag.charCodeAt(0) > 96
  );
}

const getStyleOverrides = (name: string, theme: DefaultTheme) => {
  if (theme.components && theme.components[name] && theme.components[name].styleOverrides) {
    return theme.components[name].styleOverrides;
  }
  return null;
};

const getVariantStyles = (name: string, theme: DefaultTheme) => {
  let variants = [];

  if (theme.components && theme.components[name] && theme.components[name].variants) {
    variants = theme.components[name].variants;
  }

  const variantsStyles = {} as Record<keyof any, any>;

  variants.forEach((definition: { props?: any; style?: any }) => {
    const key = propsToClassKey(definition.props);
    variantsStyles[key] = definition.style;
  });

  return variantsStyles;
};

const variantsResolver = (
  props: { ownerState?: any; [Key: keyof any]: any },
  styles: Record<keyof any, any>,
  theme: DefaultTheme,
  name: string,
) => {
  const { ownerState = {} } = props;
  const variantsStyles = [] as Array<Record<keyof any, any>>;
  const themeVariants = theme?.components?.[name]?.variants;

  if (themeVariants) {
    themeVariants.forEach((themeVaraint: { props?: any }) => {
      let isMatch = true;
      Object.keys(themeVaraint.props).forEach((key) => {
        if (ownerState[key] !== themeVaraint.props[key] && props[key] !== themeVaraint.props[key]) {
          isMatch = false;
        }
      });

      if (isMatch) {
        variantsStyles.push(styles[propsToClassKey(themeVaraint.props)]);
      }
    });
  }

  return variantsStyles;
};

export function shouldForwardProp(prop: string): boolean {
  return prop !== 'ownerState' && prop !== 'theme' && prop !== 'as';
}

const systemDefaultTheme = createTheme();

const lowercaseFirstLetter = (string: string): string => {
  return string.charAt(0).toLowerCase() + string.slice(1);
};

function createStyled<T extends object = DefaultTheme>(
  input: {
    defaultTheme?: T | undefined;
    rootShouldForwardProp?: (props: PropertyKey) => boolean;
    slotShouldForwardProp?: (props: PropertyKey) => boolean;
  } = {},
): CreateDalyaStyled<T> {
  const {
    defaultTheme = systemDefaultTheme,
    rootShouldForwardProp = shouldForwardProp,
    slotShouldForwardProp = shouldForwardProp,
  } = input;

  return (tag: any, inputOptions: DalyaStyledOptions = {}) => {
    const {
      name: componentName,
      slot: componentSlot,
      skipVariantsResolver: inputSkipVariantsResolver,
      overridesResolver,
      ...options
    } = inputOptions;

    // if skipVariantsResolver option is defined, take the value
    // otherwise true for root and false for other slots
    const skipVariantsResolver =
      inputSkipVariantsResolver !== undefined
        ? inputSkipVariantsResolver
        : (componentSlot && componentSlot !== 'Root') || false;

    let label;

    if (process.env.NODE_ENV !== 'production') {
      if (componentName) {
        label = `${componentName}-${lowercaseFirstLetter(componentSlot || 'Root')}`;
      }
    }

    let shouldForwardPropOption;

    if (componentSlot === 'Root') {
      shouldForwardPropOption = rootShouldForwardProp;
    } else if (componentSlot) {
      // any other slot specifice
      shouldForwardPropOption = slotShouldForwardProp;
    } else if (isStringTag(tag)) {
      // for string (html) tag, preserve the behavior in emotion
      shouldForwardPropOption = undefined;
    } else {
      // by default
      shouldForwardPropOption = shouldForwardProp;
    }

    const defaultStyledResolver = styledEngineStyled(tag, {
      shouldForwardProp: shouldForwardPropOption,
      label,
      ...options,
    });

    const dalyaStyledResolver = (styleArg: any, ...expressions: any[]) => {
      const expressionsWithDefaultTheme = expressions
        ? expressions.map((stylesArg) => {
            // Emotion does not use React.forwardRef for creating components, so created component stays as function.
            // this condition makes sure that we do no interpolate functions which are basically components used as selectors
            // eslint-disable-next-line no-underscore-dangle
            return typeof stylesArg === 'function' && stylesArg.__emotion_real !== stylesArg
              ? ({ theme: themeInput, ...other }: { theme: T; other: any[] }) => {
                  return stylesArg({
                    theme: isEmpty(themeInput) ? defaultTheme : themeInput,
                    ...other,
                  });
                }
              : stylesArg;
          })
        : [];

      let transformedStyleArg = styleArg;

      if (componentName && overridesResolver) {
        expressionsWithDefaultTheme.push((props: any) => {
          const theme = isEmpty(props.theme) ? defaultTheme : props.theme;
          const styleOverrides = getStyleOverrides(componentName, theme);

          if (styleOverrides) {
            const resolvedStyleOverrides = {} as Record<keyof any, CSSInterpolation>;
            Object.entries(styleOverrides).forEach(([slotKey, slotStyle]) => {
              resolvedStyleOverrides[slotKey] =
                typeof slotStyle === 'function' ? slotStyle({ ...props, theme }) : slotStyle;
            });
            return overridesResolver(props, resolvedStyleOverrides);
          }

          return null;
        });
      }

      if (componentName && !skipVariantsResolver) {
        expressionsWithDefaultTheme.push((props: any) => {
          const theme = isEmpty(props.theme) ? defaultTheme : props.theme;
          return variantsResolver(
            props,
            getVariantStyles(componentName, theme),
            theme,
            componentName,
          );
        });
      }

      const numOfCustomFnsApplied = expressionsWithDefaultTheme.length - expressions.length;

      if (Array.isArray(styleArg) && numOfCustomFnsApplied > 0) {
        const placeholders = new Array(numOfCustomFnsApplied).fill('');
        // If the type is array, then we need to add placehoders in the template for the ovverides, variants
        transformedStyleArg = [...styleArg, ...placeholders];
        transformedStyleArg.raw = [...(styleArg as any).raw, ...placeholders];
        // eslint-disable-next-line no-underscore-dangle
      } else if (typeof styleArg === 'function' && styleArg.__emotion_real !== styleArg) {
        // If the type is function, we need to define the defatul theme
        transformedStyleArg = ({
          theme: themeInput,
          ...other
        }: {
          theme: T | DefaultTheme;
          other: any[];
        }) => styleArg({ theme: isEmpty(themeInput) ? defaultTheme : themeInput, ...other });
      }

      const Component = defaultStyledResolver(transformedStyleArg, ...expressionsWithDefaultTheme);

      if (process.env.NODE_ENV !== 'production') {
        let displayName;
        if (componentName) {
          displayName = `${componentName}${componentSlot || ''}`;
        } else {
          displayName = `Styled(${getDisplayName(tag)})`;
        }

        Component.displayName = displayName;
      }

      return Component;
    };

    // ToDo : defaultStyledResolver.withConfig not exist in emotion lib
    /* if(defaultStyledResolver.withConfig){
      dalyaStyledResolver.withConfig = defaultStyledResolver.withConfig
    } */

    return dalyaStyledResolver;
  };
}

export default createStyled;
