import { ElementType } from 'react';
import { createStyled, createTheme, shouldForwardProp, Theme as DefaultTheme } from 'dalya-system';
import {
  CreateDalyaStyled as CreateDalyaStyledEngine,
  CSSInterpolation,
} from 'dalya-styled-engine';

interface DalyaStyledCommonProps<Theme extends object = DefaultTheme> {
  theme?: Theme;
  as?: ElementType;
}

interface DalyaStyledOptions {
  name?: string;
  slot?: string;
  // The difference between interpolation and CSSInterpolation is that the former supports functions based on props
  // If we want to support props in the oveerides, we will need to change the CSSInterploation to Interpolation<Props>
  overridesResolver?(props: any, styles: Record<string, CSSInterpolation>): CSSInterpolation;
  skipVariantsResolver?: boolean;
}

type CreateDalyaStyled<T extends object = DefaultTheme> = CreateDalyaStyledEngine<
  DalyaStyledCommonProps<T>,
  DalyaStyledOptions,
  T
>;

export const rootShouldForwardProp = (prop: any): boolean =>
  shouldForwardProp(prop) && prop !== 'classes';

const defaultTheme = createTheme();
const styled: CreateDalyaStyled = createStyled({
  defaultTheme,
  rootShouldForwardProp,
});

export default styled;
