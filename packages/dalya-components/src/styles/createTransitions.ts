interface Easing {
  standard: string;
  decelerated: string;
  accelerated: string;
  sharp: string;
}

// implementation refers to https://material.google.com/motion/duration-easing.html#duration-easing-natural-easing-curves
export const easing: Easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)', // easeInOut
  // enters quickly and slowly decelerate to a resting point
  decelerated: 'cubic-bezier(0, 0, 0.2, 1)', // easeOut
  // the element starts at rest and ends at peak velocity
  accelerated: 'cubic-bezier(0.4, 0, 1, 1)', // easeIn
  // The sharp curve is used by objects that may return to the screen at any time
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
};

interface Duration {
  shortest: number;
  shorter: number;
  short: number;
  standard: number;
  complex: number;
  enteringScreen: number;
  leavingScreen: number;
}

export const duration: Duration = {
  shortest: 150,
  shorter: 200,
  short: 250,
  // most basic recommended timing
  standard: 300,
  complex: 375,
  // recommended when element is entering screen
  enteringScreen: 225,
  // recommended when element is leaving screen
  leavingScreen: 195,
};

function formatMs(milliseconds: number) {
  return `${Math.round(milliseconds)}ms`;
}

function getAutoHeightDuration(height: number) {
  if (!height) {
    return 0;
  }

  const constant = height / 36;

  // https://www.wolframalpha.com/input/?i=(4+%2B+15+*+(x+%2F+36+)+**+0.25+%2B+(x+%2F+36)+%2F+5)+*+10
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}

function isStringArray(array: any): boolean {
  return Array.isArray(array) && array.every((element) => typeof element === 'string');
}

// validate if value can be converted to number type
function isNumber(value: any): value is number {
  return !Number.isNaN(parseFloat(value));
}

function isString(value: any): value is string {
  return typeof value === 'string';
}

type CreateTransitionOptions = {
  duration: number | string;
  easing: string;
  delay: number | string;
};

interface CreateTransitionProps {
  props: string | string[];
  options?: Partial<CreateTransitionOptions>;
}

export interface TransitionsOptions {
  easing?: Partial<Easing>;
  duration?: Partial<Duration>;
  create?: ({ props, options }: CreateTransitionProps) => string;
  getAutoHeightDuration?: (height: number) => number;
}

export interface Transitions {
  easing: Easing;
  duration: Duration;
  create: ({ props, options }: CreateTransitionProps) => string;
  getAutoHeightDuration: (height: number) => number;
}

function createTransitions(inputTransitions: TransitionsOptions): Transitions {
  const mergedEasing = {
    ...easing,
    ...inputTransitions.easing,
  };

  const mergedDuration = {
    ...duration,
    ...inputTransitions.duration,
  };

  const create = ({ props = ['all'], options = {} }: CreateTransitionProps) => {
    const {
      duration: durationOption = mergedDuration.standard,
      easing: easingOption = mergedEasing.standard,
      delay = 0,
      ...other
    } = options;

    if (process.env.NODE_ENV !== 'production') {
      const isPropsStringOrStringArray = Array.isArray(props)
        ? isStringArray(props)
        : isString(props);

      if (!isPropsStringOrStringArray) {
        console.error(
          'Dalya: Argument "options.props" in createTransitions.create({options}) must be string or Array type',
        );
      }

      if (!isNumber(durationOption) && !isString(durationOption)) {
        console.error(
          'Dalya: Argument "options.duration" in createTransitions.create({options}) must be number or string type',
        );
      }

      if (!isString(easingOption)) {
        console.error(
          'Dalya: Argument "options.easingOption" in createTransitions.create({options}) must be string type',
        );
      }

      if (!isNumber(delay) && !isString(delay)) {
        console.error(
          'Dalya: Argument "options.delay" in createTransitions.create({options}) must be number or string type',
        );
      }

      if (Object.keys(other).length !== 0) {
        console.error(
          `Dalya: Unrecognized argument(s) in createTransitions.create({options}), [${Object.keys(
            other,
          ).join(',')}]`,
        );
      }
    }

    const propsInArray = Array.isArray(props) ? props : [props];
    const durationOptionInString = isNumber(durationOption)
      ? formatMs(durationOption)
      : durationOption;

    const delayInString = isNumber(delay) ? formatMs(delay) : delay;

    return propsInArray
      .map(
        (animatedProp) =>
          `${animatedProp} ${durationOptionInString} ${easingOption} ${delayInString}`,
      )
      .join(',');
  };

  return {
    getAutoHeightDuration,
    create,
    ...inputTransitions,
    easing: mergedEasing,
    duration: mergedDuration,
  };
}

export default createTransitions;
