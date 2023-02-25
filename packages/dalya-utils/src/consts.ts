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

export const isStateClass = (state: any): state is GlobalStateSlot => {
  return stateClasses.includes(state);
};
