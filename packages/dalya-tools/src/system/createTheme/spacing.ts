import { getPath } from './style';

export type SpacingValueType = string | number | null | undefined;

// createUnaryUnit function returns function that takes number as parameter and returns param * default value
// unary operation is an operation with only one operand
export function createUnaryUnit<Spacing>(
  theme: { spacing: Spacing },
  themeKey: string,
  defaultValue: Spacing,
  propName: string,
) {
  // Nullish coleasing operator
  // if themeKey exists on theme, return theme[themeKey]
  // If not, return defaultValue
  const themeSpacing = getPath(theme, themeKey, false) ?? defaultValue;

  if (typeof themeSpacing === 'number') {
    return (abs: SpacingValueType) => {
      if (typeof abs === 'string') {
        return abs;
      }

      if (process.env.NODE_ENV !== 'production') {
        if (typeof abs !== 'number') {
          console.error(
            `Expected ${propName} argument to be a number or a string, got ${JSON.stringify(abs)}`,
          );
        }
      }

      return themeSpacing * (abs as number);
    };
  }

  if (Array.isArray(themeSpacing)) {
    return (abs: string | number) => {
      if (typeof abs === 'string') {
        return abs;
      }

      if (process.env.NODE_ENV !== 'production') {
        if (!Number.isInteger(abs)) {
          console.error(
            [
              `\`theme.${themeKey}\` array type cannot be combined with non integer values.` +
                `You shoud either use an integer value that can be used as index, or defined the \`theme.${themeKey}\` as a number.`,
            ].join('\n'),
          );
        } else if (abs > themeSpacing.length - 1) {
          console.error(
            [
              `The value provided (${abs}) overflows.`,
              `Supported values are: ${JSON.stringify(themeSpacing)}`,
              `${abs} > ${themeSpacing.length - 1}, you need to add the missing values`,
            ].join('\n'),
          );
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return themeSpacing[abs];
    };
  }

  if (typeof themeSpacing === 'function') {
    return themeSpacing;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(
      [
        `\`theme.${themeKey}\` value (${JSON.stringify(themeSpacing, null, 2)}) is invalid`,
        'It should be a number, an array or a function.',
      ].join('\n'),
    );
  }
  return () => undefined;
}

export function createUnarySpacing<Spacing>(theme: { spacing: Spacing }) {
  return createUnaryUnit(theme, 'spacing', 8 as Spacing, 'spacing');
}

function spacing() {
  return 'TODO';
}

export default spacing;
