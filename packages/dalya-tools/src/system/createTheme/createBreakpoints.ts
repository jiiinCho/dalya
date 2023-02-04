import { OverridableStringUnion } from 'dalya-types';

export interface BreakpointOverrides {
  [key: keyof any]: unknown;
}

export type Breakpoint = OverridableStringUnion<
  'xs' | 'sm' | 'md' | 'lg' | 'xl',
  BreakpointOverrides
>;

type BreakpointTemplate = {
  [key in Breakpoint]: number;
};

export interface Breakpoints {
  keys: Breakpoint[];
  values: BreakpointTemplate;
  up: (key: Breakpoint) => string;
  down: (key: Breakpoint) => string;
  only: (key: Breakpoint) => string;
  between: (start: Breakpoint, end: Breakpoint) => string;
  not: (key: Breakpoint) => string;
  unit: string; // unit should be returns for other CSS usage
}

// param extends return type
export interface BreakpointsOptions extends Partial<Breakpoints> {
  /**
   * The increment divided by 100 used to implement exclusive breakpoints.
   * For example, `step: 5` means that `down(500)` will result in `'(max-width: 499.95px)'`.
   * @default 5
   */
  step?: number; // step is only used in createBreakpoints and no need to be returned for other CSS usage
  /**
   * The unit used for the breakpoint's values.
   * @default 'px'
   */
  unit?: string;
}

// Sorted ASC by size. breakpointKeys is used statically for propTypes
export const breakpointKeys = ['xs', 'sm', 'md', 'lg', 'xl'];

const sortBreakpointsValues = (values: BreakpointTemplate): BreakpointTemplate => {
  const breakpointKeysInSortBreakpointsValues = Object.keys(values).map((key) => key as Breakpoint);
  const breakpointsAsArray =
    breakpointKeysInSortBreakpointsValues.map((key: Breakpoint) => ({
      key,
      val: values[key],
    })) || [];

  // separate key and value to use sort function
  breakpointsAsArray.sort((breakpoint1, breakpoint2) => breakpoint1.val - breakpoint2.val);

  return breakpointsAsArray.reduce((acc, obj) => {
    return { ...acc, [obj.key]: obj.val };
  }, {} as BreakpointTemplate);
};

const customBreakpointsTypeErrorHandler = (key: keyof any, value: any) => {
  throw new Error(
    `Error in custom breakpoints. key: ${String(key)}, values[key]: ${String(
      value,
    )}. Custom breakpoints value should be 'number' type`,
  );
};

// @media is inclusive by the CSS specification
// it applies styles to all media types that match the specified conditions.
// For example, you can use the "@media" rule to apply styles only when the screen width is greater than a certain value. The styles will apply to all devices that match this condition, including desktops, laptops, tablets and smartphones, as long as their screens are wide enough to match the condition.
function createBreakpoints(breakpoints: BreakpointsOptions): Breakpoints {
  const {
    // breakpoint start at this value
    values = {
      xs: 0, // mobile
      sm: 600, // tablet
      md: 900, // small labtop
      lg: 1200, // desktop
      xl: 1536, // large screen
    },
    unit = 'px',
    step = 5, // guessing step is to be sure styles do not interfere each segments. Let's say for talet we assign range to max-width: 899.95px, and assign desktop style starts from min-width:900px
    ...other
  } = breakpoints;

  const sortedValues = sortBreakpointsValues(values);
  const keys = Object.keys(sortedValues).map((key) => key as Breakpoint);

  function up(key: Breakpoint) {
    if (typeof values[key] !== 'number') {
      customBreakpointsTypeErrorHandler(key, values[key]);
    }
    const value = values[key] as number;
    return `@media (min-width:${value}${unit})`;
  }

  function down(key: Breakpoint): string {
    if (typeof values[key] !== 'number') {
      customBreakpointsTypeErrorHandler(key, values[key]);
    }
    return `@media (max-width:${values[key] - step / 100}${unit})`;
  }

  function between(start: Breakpoint, end: Breakpoint) {
    if (typeof values[start] !== 'number' || typeof values[end] !== 'number') {
      customBreakpointsTypeErrorHandler(start, values[start]);
      customBreakpointsTypeErrorHandler(end, values[end]);
    }
    const value = values[start] as number;
    return `@media (min-width:${value}${unit}) and (max-width:${values[end] - step / 100}${unit})`;
  }

  function only(key: Breakpoint) {
    if (keys.indexOf(key) + 1 < keys.length) {
      return between(key, keys[keys.indexOf(key) + 1]);
    }
    // key = 'xl'
    return up(key);
  }

  function not(key: Breakpoint) {
    const keyIndex = keys.indexOf(key);
    if (keyIndex === 0) {
      return up(keys[1]);
    }

    if (keyIndex === keys.length - 1) {
      return down(keys[keyIndex]);
    }

    return between(key, keys[keys.indexOf(key) + 1]).replace('@media', '@media not all and');
  }

  return {
    keys,
    values: sortedValues,
    up,
    down,
    between,
    only,
    not,
    unit,
    ...other,
  };
}

export default createBreakpoints;
