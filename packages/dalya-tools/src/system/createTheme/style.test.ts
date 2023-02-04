import { getPath } from './style';

describe('getPath', () => {
  const themeKey = 'spacing';

  it('should return theme[themeKey] by default', () => {
    const theme = { spacing: 8 };
    expect(getPath(theme, themeKey, false)).toBe(8);
  });

  it('should return theme.vars[themeKey] if theme has vars property', () => {
    const themeWithVars = { spacing: 8, vars: { spacing: 16 } };
    expect(getPath(themeWithVars, themeKey)).toBe(16);
  });

  it('should return default value if theme.vars[themeKey] is empty string', () => {
    const themeWithEmptyVars = { spacing: 8, vars: { spacing: '' } };
    expect(getPath(themeWithEmptyVars, themeKey)).toBe(8);
  });

  it('should return empty string if theme[themeKey] is empty string', () => {
    const themeEmptyString = { spacing: '', vars: { spacing: '' } };
    expect(getPath(themeEmptyString, themeKey)).toBe('');
  });

  it('foo', () => {
    const arr = [0, 8, 16];
    const themeArray = { spacing: arr };
    expect(getPath(themeArray, themeKey, false)).toEqual(arr);
  });
});
