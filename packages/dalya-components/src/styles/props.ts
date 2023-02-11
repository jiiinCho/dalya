import { ButtonBaseProps } from '../ButtonBase';
import { ButtonProps } from '../Button';

export type ComponentsProps = {
  [Name in keyof ComponentsPropsList]?: Partial<ComponentsPropsList[Name]>;
};

export interface ComponentsPropsList {
  DalyaButton: ButtonProps;
  DalyaButtonBase: ButtonBaseProps;
}
