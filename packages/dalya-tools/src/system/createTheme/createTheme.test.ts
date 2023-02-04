import createTheme from './createTheme';

describe('createTheme', () => {
  const breakpointsValues = {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  };

  // round rounds the given value to five decimal places
  // The e notation is used to represent powers of 10, where the number following the "e" is the exponent. In this case, 1e5 is equivalent to 1 * 10^5 which is equal to 100,000.
  //if value is 1.234567, the return is 1.23457
  const round = (value: number) => Math.round(value * 1e5) / 1e5;

  const theme = createTheme({
    spacing: (val: number) => `${val * 10}px`,
    breakpoints: {
      keys: ['xs', 'sm', 'md', 'lg', 'xl'],
      values: breakpointsValues,
      up: (key: string) => {
        //@ts-ignore
        return `@media (min-width:${breakpointsValues[key] + 5}rem)`;
      },
      unit: 'rem',
    },
    palette: {
      primary: {
        main: 'rgb(0, 0, 225)',
      },
      secondary: {
        main: 'rgb(0, 255, 0)',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", "sans-serif"',
      fontWeightLight: 300,
      fontSize: 14,
      body1: {
        fontFamily: '"Roboto", "Helvetica", "Arial", "sans-serif"',
        fontWeight: 400,
        fontSize: '1rem',
        letterSpacing: `${round(0.15 / 16)}em`,
        lineHeight: 1.5,
      },
      body2: {
        fontFamily: '"Roboto", "Helvetica", "Arial", "sans-serif"',
        fontWeigh: 400,
        fontSize: `${14 / 16}em`,
        letterSpacing: `${round(0.15 / 14)}em`,
        lineHeight: 1.43,
      },
    },
  });

  it('should work', () => {
    expect(theme.spacing(1.5)).toBe('15px');
    expect(theme.breakpoints.up('sm')).toBe('@media (min-width:605rem)');
    expect(theme.breakpoints.down('lg')).toBe('@media (max-width:1279.95rem)');
  });

  // TODO: Add styled()
});
