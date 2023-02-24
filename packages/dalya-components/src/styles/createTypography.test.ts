import { common } from 'dalya-components/colors';
import { createPalette } from './createPalette';
import createTypography, { Variant } from './createTypography';

describe('createTypography', () => {
  const palette = createPalette({});

  it('should create a material design typography accoding to spec', () => {
    const typography = createTypography({ palette });
    expect(typography.fontSize).toBe(14);
  });

  it('should create a typography with custom fontSize', () => {
    const typography = createTypography({ palette, typography: { fontSize: 15 } });
    expect(typography.fontSize).toBe(15);
  });

  it('should accept a function in typography property', () => {
    const typography = createTypography({
      palette,
      typography: () => {
        return { fontSize: 20 };
      },
    });

    expect(typography.fontSize).toBe(20);
  });

  it('can access default palette object in typography function if palette is not assigned', () => {
    const typography = createTypography({
      typography: (defaultPalette) => {
        return { fontSize: 20, color: defaultPalette.common.black };
      },
    });

    expect(typography.fontSize).toBe(20);
    // @ts-ignore
    expect(typography.color).toBe(common.black); // TODO: Find usage
  });

  it('should create a typography with a custom baseFontSize', () => {
    const typography = createTypography({ palette, typography: { htmlFontSize: 10 } });
    expect(typography.h2.fontSize).toBe('6rem'); // 60 / 10 * 1 = 6rem
  });

  it('should create a typography with custom h1 value and unit', () => {
    const customFontSize = '18px';
    const typography = createTypography({
      palette,
      typography: { h1: { fontSize: customFontSize } },
    });

    expect(typography.h1.fontSize).toBe(customFontSize);
  });

  it('should apply a CSS property to all the variants', () => {
    const typography = createTypography({
      palette,
      typography: { allVariants: { marginLeft: 0 } },
    });

    const allVariants: Variant[] = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'subtitle1',
      'subtitle2',
      'body1',
      'body2',
      'button',
      'caption',
      'overline',
    ];

    allVariants.forEach((variant) => {
      expect(typography[variant].marginLeft).toBe(0);
    });
  });

  it('only defines letter-spacing if the font-family is not overwritten', () => {
    expect(createTypography({ palette }).h1.letterSpacing).toBe('-0.01562em');

    expect(
      createTypography({ palette, typography: { fontFamily: 'Gotham' } }).h1.letterSpacing,
    ).toBe(undefined);
  });

  describe('warnings', () => {
    const logErrorSpy = jest.spyOn(console, 'error');

    it('logs an error if `fontSize` is not of type number', () => {
      // @ts-ignore
      createTypography({ typography: { fontSize: '1' } });

      expect(logErrorSpy).toBeCalledWith('Dalya: `fontSize` is required to be number type');
    });

    it('logs an error if `htmlFontSize` is not of type number', () => {
      // @ts-ignore
      createTypography({ typography: { htmlFontSize: '1' } });
      expect(logErrorSpy).toBeCalledWith('Dalya: `htmlFontSize` is required to be number type');
    });
  });
});
