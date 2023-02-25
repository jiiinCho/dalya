import ClassNameGenerator from '../ClassNameGenerator';

export const stateClasses = [
  'active',
  'checked',
  'completed',
  'disabled',
  'error',
  'expanded',
  'focused',
  'focusVisible',
  'required',
  'selected',
] as const;

export type GlobalStateSlot = typeof stateClasses[number];

const isStateClass = (state: any): state is GlobalStateSlot => {
  return stateClasses.includes(state);
};

function generateUtilityClass(
  componentName: string,
  slot: string,
  globalStatePrefix = 'Dalya',
): string {
  return isStateClass(slot)
    ? `${globalStatePrefix}-${slot}`
    : `${ClassNameGenerator.generate(componentName)}-${slot}`;
}

export default generateUtilityClass;
