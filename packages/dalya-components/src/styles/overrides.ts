import { CSSObject, CSSInterpolation } from 'dalya-styled-engine';
import { ButtonClassKey } from '../Button';
import { ComponentsPropsList } from './props';

type ComponentNameToClassKey = {
  DalyaButton: ButtonClassKey; // 'root' | 'text'
};

type OverridesStyleRule<
  ClassKey extends string = string,
  ComponentName = keyof ComponentsPropsList,
  Theme = unknown,
> = Record<
  ClassKey,
  | CSSInterpolation
  | ((
      // Record<string, unknown> is for other props that the slot receive internally
      // Documenting all ownerStates could be a huge work, let's wawit until we have a real needs from developers
      props: (ComponentName extends keyof ComponentsPropsList
        ? { ownerState: ComponentsPropsList[ComponentName] & Record<string, unknown> }
        : {}) & { theme: Theme } & Record<string, unknown>,
    ) => CSSInterpolation)
>;

export type ComponentsOverrides<Theme = unknown> = {
  [Name in keyof ComponentNameToClassKey]?: Partial<
    OverridesStyleRule<ComponentNameToClassKey[Name], Name, Theme>
  >;
} & {
  DalyaCSSBaseline?: CSSObject | string | ((theme: Theme) => CSSInterpolation);
};
