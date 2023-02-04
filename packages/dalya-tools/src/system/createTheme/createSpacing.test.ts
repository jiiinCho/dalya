import createSpacing, { Spacing } from './createSpacing';

describe('createSpacing', () => {
  it('should be configurable', () => {
    let spacing: Spacing;

    spacing = createSpacing();
    expect(spacing(1)).toBe('8px');

    spacing = createSpacing(10); // spacing is a function that has 10 as base unit
    expect(spacing(1)).toBe('10px');

    spacing = createSpacing([0, 8, 16]);
    expect(spacing(0)).toBe('0px');
    expect(spacing(1)).toBe('8px');
    expect(spacing(2)).toBe('16px');
    expect(spacing(0, 1, 2)).toBe('0px 8px 16px');

    spacing = createSpacing(['0rem', '8rem', '16rem']);
    expect(spacing(1)).toBe('8rem');

    spacing = createSpacing((factor: number) => factor ** 2);
    expect(spacing(8)).toBe('64px');

    spacing = createSpacing((factor: number) => `${0.25 * factor}rem`);
    expect(spacing(4)).toBe('1rem');
  });
});
