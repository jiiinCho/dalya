import { Interpolation } from 'dalya-styled-engine';
import { ComponentsPropsList } from './props';

export type ComponentVariants<Theme> = {
  [Name in keyof ComponentsPropsList]?: Array<{
    props: Partial<ComponentsPropsList[Name]>;
    style: Interpolation<{ theme: Theme }>;
  }>;
};
