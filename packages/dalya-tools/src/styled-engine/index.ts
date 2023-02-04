import * as CSS from 'csstype';
import { ElementType, ComponentClass, ComponentProps, Ref, JSXElementConstructor } from 'react';
import { PropsOf } from '@emotion/react';
import emStyled, { StyledComponent, StyledOptions } from '@emotion/styled';

export { default } from '@emotion/styled';

export interface FilteringStyledOptions<Props, ForwardedProps extends keyof Props = keyof Props> {
  label?: string;
  shouldForwardProp?(propName: PropertyKey): propName is ForwardedProps;
  target?: string;
}

export interface CreateDalyaStyled<
  DalyaStyledCommonProps extends {},
  DalyaStyledOptions,
  Theme extends object,
> {
  <
    C extends ComponentClass<ComponentProps<C>>,
    ForwardedProps extends keyof ComponentProps<C> = keyof ComponentProps<C>,
  >(
    component: C,
    options: FilteringStyledOptions<ComponentProps<C>, ForwardedProps> & DalyaStyledOptions,
  ): CreateStyledComponent<
    Pick<PropsOf<C>, ForwardedProps> & DalyaStyledCommonProps,
    {},
    { ref?: Ref<InstanceType<C>> },
    Theme
  >;
  <C extends ComponentClass<ComponentProps<C>>>(
    component: C,
    options?: StyledOptions<PropsOf<C> & DalyaStyledOptions> & DalyaStyledOptions,
  ): CreateStyledComponent<
    PropsOf<C> & DalyaStyledCommonProps,
    {},
    { ref?: Ref<InstanceType<C>> },
    Theme
  >;
  <
    C extends JSXElementConstructor<ComponentProps<C>>,
    ForwardedProps extends keyof ComponentProps<C> = keyof ComponentProps<C>,
  >(
    component: C,
    options: FilteringStyledOptions<ComponentProps<C>, ForwardedProps> & DalyaStyledOptions,
  ): CreateStyledComponent<
    Pick<PropsOf<C>, ForwardedProps> & DalyaStyledCommonProps,
    {},
    {},
    Theme
  >;
  <C extends JSXElementConstructor<ComponentProps<C>>>(
    component: C,
    options?: StyledOptions<PropsOf<C> & DalyaStyledCommonProps> & DalyaStyledOptions,
  ): CreateStyledComponent<PropsOf<C> & DalyaStyledCommonProps, {}, {}, Theme>;
  <
    Tag extends keyof JSX.IntrinsicElements,
    ForwardedProps extends keyof JSX.IntrinsicElements[Tag] = keyof JSX.IntrinsicElements[Tag],
  >(
    tag: Tag,
    options?: FilteringStyledOptions<JSX.IntrinsicElements[Tag], ForwardedProps> &
      DalyaStyledOptions,
  ): CreateStyledComponent<
    DalyaStyledCommonProps,
    Pick<JSX.IntrinsicElements[Tag], ForwardedProps>,
    {},
    Theme
  >;
  <Tag extends keyof JSX.IntrinsicElements>(
    tag: Tag,
    options?: StyledOptions<DalyaStyledCommonProps> & DalyaStyledOptions,
  ): CreateStyledComponent<DalyaStyledCommonProps, JSX.IntrinsicElements[Tag], {}, Theme>;
}

export interface ArrayCSSInterpolation extends Array<CSSInterpolation> {}

export type CSSInterpolation = InterpolationPrimitive | ArrayCSSInterpolation;

export interface ComponentSelector {
  __emotion_styles: any;
}

export type Keyframes = {
  name: string;
  styles: string;
  anim: number;
  toString: () => string;
} & string;

export interface SerializedStyles {
  name: string;
  styles: string;
  map?: string;
  next?: SerializedStyles;
}

export type CSSProperties = CSS.PropertiesFallback<number | string>;

export type CSSPropertiesWithMultiValues = {
  [K in keyof CSSProperties]: CSSProperties[K] | Array<Extract<CSSProperties[K], string>>;
};

export type CSSPseudos = { [K in CSS.Pseudos]?: unknown | CSSObject };

export interface CSSOthersObject {
  [propertiesName: string]: unknown | CSSInterpolation;
}

export interface CSSObject extends CSSPropertiesWithMultiValues, CSSPseudos, CSSOthersObject {}

export type InterpolationPrimitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | ComponentSelector
  | Keyframes
  | SerializedStyles
  | CSSObject;

export interface FunctionInterpolation<Props> {
  (props: Props): Interpolation<Props>;
}
export interface ArrayInterpolation<Props> extends Array<Interpolation<Props>> {}

export type Interpolation<Props> =
  | InterpolationPrimitive
  | ArrayInterpolation<Props>
  | FunctionInterpolation<Props>;

export interface CreateStyledComponent<
  ComponentProps extends {},
  SpecificComponentProps extends {} = {},
  JSXProps extends {} = {},
  T extends object = {},
> {
  (
    ...styles: Array<Interpolation<ComponentProps & SpecificComponentProps & { theme: T }>>
  ): StyledComponent<ComponentProps, SpecificComponentProps, JSXProps>;

  /**
   * @typeparam AdditionProps - Additional props to add to your styled component
   */
  <AdditionalProps extends {}>(
    ...styles: Array<
      Interpolation<ComponentProps & SpecificComponentProps & AdditionalProps & { theme: T }>
    >
  ): StyledComponent<ComponentProps & AdditionalProps, SpecificComponentProps, JSXProps>;

  (
    template: TemplateStringsArray,
    ...styles: Array<Interpolation<ComponentProps & SpecificComponentProps & { theme: T }>>
  ): StyledComponent<ComponentProps, SpecificComponentProps, JSXProps>;

  /**
   * @typeparam AdditionProps - Additional props to add to your styled component
   */
  <AdditionalProps extends {}>(
    template: TemplateStringsArray,
    ...styles: Array<
      Interpolation<ComponentProps & SpecificComponentProps & AdditionalProps & { theme: T }>
    >
  ): StyledComponent<ComponentProps & AdditionalProps, SpecificComponentProps, JSXProps>;
}

export function styled(tag: any, options?: any) {
  const stylesFactory = emStyled(tag, options);

  if (process.env.NOD_ENV !== 'production') {
    return (...styles: any[]) => {
      const component = typeof tag === 'string' ? `"${tag}"` : 'component';
      if (styles.length === 0) {
        console.error(
          [
            `You called \`styled(${component})()\` without a \`style\` argument.`,
            'You must provide a `styles` argument: `styled("div")(styleYouForgetToPass)`.',
          ].join('\n'),
        );
      } else if (styles.some((style) => style === undefined)) {
        console.error(`styled(${component})(...args) API requires all its args to be defined.`);
      }
      return stylesFactory(...styles);
    };
  }

  return stylesFactory;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const internal_processStyles = (
  tag: ElementType & { __emotion_styles?: any },
  processor: (styles: any) => any,
) => {
  // Emotion attaches all the styles as `__emotion_styles`
  // eslint-disable-next-line no-underscore-dangle
  if (Array.isArray(tag.__emotion_styles)) {
    // eslint-disable-next-line no-underscore-dangle
    tag.__emotion_styles = processor(tag.__emotion_styles);
  }
};
