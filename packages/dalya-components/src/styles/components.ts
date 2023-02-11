import { ComponentsProps } from './props';
import { ComponentsOverrides } from './overrides';
import { ComponentVariants } from './variants';

export interface Components<Theme = unknown> {
  DalyaButton?: {
    defaultProps?: ComponentsProps['DalyaButton'];
    styleOverrides?: ComponentsOverrides<Theme>['DalyaButton'];
    variants?: ComponentVariants<Theme>['DalyaButton'];
  };
}
