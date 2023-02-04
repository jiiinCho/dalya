import { createUnarySpacing } from './spacing';

describe('createUnarySpacing', () => {
  const theme = { spacing: 13 };
  it('returns function that returns unary spacing value based on default themeSpacing', () => {
    expect(createUnarySpacing(theme)(2)).toBe(26);
  });
});
