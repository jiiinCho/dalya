import { createUnarySpacing } from './spacing';

export type SpacingArgument = number | string;

export interface Spacing {
  (): string;
  (value: number): string;
  (topBottom: SpacingArgument, rightLeft: SpacingArgument): string;
  (top: SpacingArgument, rightLeft: SpacingArgument, bottom: SpacingArgument): string;
  (
    top: SpacingArgument,
    right: SpacingArgument,
    bottom: SpacingArgument,
    left: SpacingArgument,
  ): string;
}

export type SpacingOptions =
  | number
  | Spacing
  | ((abs: number) => number | string)
  | ((abs: number | string) => number | string)
  | ReadonlyArray<string | number>;

function createSpacing(spacingInput: SpacingOptions = 8): Spacing {
  // Already transformed
  if ((spacingInput as any).dalya) {
    // createSpacing returns Spacing
    return spacingInput as Spacing;
  }

  const transform = createUnarySpacing({
    spacing: spacingInput,
  });

  // ..argsInput: ReadonlyArray<number | string> does not mean param is array type
  // 💩 spacing([1, 2, 3])
  // 🍭 spacing(1, 2, 3)
  const spacing = (...argsInput: ReadonlyArray<number | string>): string => {
    if (process.env.NODE_ENV !== 'production') {
      if (argsInput.length > 4) {
        console.error(
          `Too many arugments provided, expected between 0 and 4, got ${argsInput.length}`,
        );
      }
    }

    const args = argsInput.length === 0 ? [1] : argsInput;
    return args
      .map((argument) => {
        const output = transform(argument);
        return typeof output === 'number' ? `${output}px` : output;
      })
      .join(' ');
  };

  spacing.dalya = true;

  // createSpacing returns (...argsInput) => {} function with spacing.dalya set to true
  return spacing;
}

export default createSpacing;
