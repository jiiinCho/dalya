import {
  recomposeColor,
  hexToRgb,
  hslToRgb,
  decomposeColor,
  getContrastRatio,
  getLuminance,
  darken,
  lighten,
  alpha,
  rgbToHex,
  emphasize,
  colorChannel,
} from './colorConverter';

describe('colorManipulator', () => {
  describe('recomposeColor', () => {
    it('converts a decomposed rgb color object to a string', () => {
      const mockColor = {
        type: 'rgb',
        values: [255, 255, 255],
      };
      expect(recomposeColor(mockColor)).toBe('rgb(255, 255, 255)');
    });

    it('converts a decomposed rgba color object to a string', () => {
      const mock = {
        type: 'rgba',
        values: [255, 255, 255, 0.5],
      };
      expect(recomposeColor(mock)).toBe('rgba(255, 255, 255, 0.5)');
    });

    it('converts a decomposed CSS4 color object to a string', () => {
      const mock = {
        type: 'color',
        colorSpace: 'display-p3',
        values: [0.5, 0.3, 0.2],
      };
      expect(recomposeColor(mock)).toBe('color(display-p3 0.5 0.3 0.2)');
    });

    it('converts a decomposed hsl color object to a string', () => {
      const mock = {
        type: 'hsl',
        values: [100, 50, 25],
      };
      expect(recomposeColor(mock)).toBe('hsl(100, 50%, 25%)');
    });

    it('converts a decomposed hsla color object to a string', () => {
      const mock = {
        type: 'hsla',
        values: [100, 50, 25, 0.5],
      };
      expect(recomposeColor(mock)).toBe('hsla(100, 50%, 25%, 0.5)');
    });

    describe('exception', () => {
      it('throws an exception for unsupported color type', () => {
        const mock = {
          type: 'unknown type',
          values: [100, 50, 25, 0.5],
        };
        expect(() => {
          recomposeColor(mock);
        }).toThrow('Dalya: Unsupported color type `unknown type`. Could not recomposed color');
      });
    });
  });

  describe('hexToRgb', () => {
    it('converts three digits hex color to rgb color', () => {
      expect(hexToRgb('#9f3')).toBe('rgb(153, 255, 51)');
    });

    it('converts six digits hex color to rgb color', () => {
      expect(hexToRgb('#a94fd3')).toBe('rgb(169, 79, 211)');
    });

    it('converts six digits alpha hex color to rgba color', () => {
      expect(hexToRgb('#111111f8')).toBe('rgba(17, 17, 17, 0.973)');
    });

    describe('exceptions', () => {
      it('throws an exception for unsupported type argument', () => {
        expect(() => {
          hexToRgb('abc');
        }).toThrow(
          'Dalya: Unsupported hex format. Should start with `#`(hash symbol) but got `abc`',
        );
      });

      it('throws an exception for unsupported hex format', () => {
        expect(() => {
          hexToRgb('#rrggbbaa1122');
        }).toThrow(
          'Dalya: Unsuppported hex input./nIt should be either three, six digits or eight digits but got `#rrggbbaa1122`',
        );
      });
    });
  });

  describe('rgbToHex', () => {
    it('converts an rgb color to a hex color', () => {
      expect(rgbToHex('rgb(169, 79, 211)')).toBe('#a94fd3');
    });

    it('converts an rgba color to a hex color', () => {
      expect(rgbToHex('rgba(169, 79, 211, 1)')).toBe('#a94fd3ff');
    });

    it('idempotent', () => {
      expect(rgbToHex('#A94FD3')).toBe('#A94FD3');
    });
  });

  describe('hslToRgb', () => {
    it('converts hsl color to rgb color', () => {
      expect(hslToRgb('hsl(281, 60%, 57%)')).toBe('rgb(169, 80, 211)');
    });

    it('converts hsla color to rgba color', () => {
      expect(hslToRgb('hsla(281, 60%, 57%, 0.5)')).toBe('rgba(169, 80, 211, 0.5)');
    });

    it('allows to convert values only', () => {
      expect(hslToRgb(decomposeColor('hsl(281, 60%, 57%)'))).toBe('rgb(169, 80, 211)');
    });
  });

  describe('decomposeColor', () => {
    it('converts an rgb color string to an object with `type` and `value` keys', () => {
      const { type, values } = decomposeColor('rgb(255, 255, 255)');
      expect(type).toBe('rgb');
      expect(values).toEqual([255, 255, 255]);
    });

    it('converts an rgba color string to an object with `type` and `value` keys', () => {
      const { type, values } = decomposeColor('rgba(255, 255, 255, 0.5)');
      expect(type).toBe('rgba');
      expect(values).toEqual([255, 255, 255, 0.5]);
    });

    it('converts an hsl color string to an object with `type` and `value` keys', () => {
      const { type, values } = decomposeColor('hsl(100, 50%, 25%)');
      expect(type).toBe('hsl');
      expect(values).toEqual([100, 50, 25]);
    });

    it('converts an hsla color string to an object with `type` and `value` keys', () => {
      const { type, values } = decomposeColor('hsla(100, 50%, 25%, 0.5)');
      expect(type).toBe('hsla');
      expect(values).toEqual([100, 50, 25, 0.5]);
    });

    it('converts CSS4 color with color space display-3', () => {
      const { type, values, colorSpace } = decomposeColor('color(display-p3 0 1 0)');
      expect(type).toBe('color');
      expect(colorSpace).toBe('display-p3');
      expect(values).toEqual([0, 1, 0]);
    });

    it('converts an alpha CSS4 color with color space display-3', () => {
      const { type, values, colorSpace } = decomposeColor('color(display-p3 0 1 0 /0.4)');
      expect(type).toBe('color');
      expect(colorSpace).toBe('display-p3');
      expect(values).toEqual([0, 1, 0, 0.4]);
    });

    it('idempotent', () => {
      const output1 = decomposeColor('hsla(100, 50%, 25%, 0.5)');
      const output2 = decomposeColor(output1);
      expect(output2).toStrictEqual(output2);
    });

    it('converts rgba hex', () => {
      expect(decomposeColor('#111111f8')).toStrictEqual({
        type: 'rgba',
        values: [17, 17, 17, 0.973],
      });
    });

    describe('exceptions', () => {
      it('should throw error with unsupported CSS color input', () => {
        expect(() => {
          decomposeColor('color');
        }).toThrow(
          'Dalya: Unsupported CSS color `color`. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().',
        );
      });

      it('should throw error with inexistent color format', () => {
        expect(() => {
          decomposeColor('foo(display-p3 0 1 0)');
        }).toThrow(
          'Dalya: Unsupported color format `foo`. The following formats are supported: rgb, rgba, hsl, hsla, and color.',
        );
      });

      it('should throw error with inexistent color space', () => {
        const decomposeWithError = () => decomposeColor('color(foo 0 1 0)');
        expect(decomposeWithError).toThrow(
          'Dalya: Does not support `foo` color space. The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020',
        );
      });

      it('should throw error with unsupported color value types', () => {
        const decomposeWithError = () => decomposeColor('rgb(a, b, c)');
        expect(decomposeWithError).toThrow(
          'Dalya: Unsupported color values. Given color type `rgb` includes NaN values. Color values should be number type',
        );
      });
    });
  });

  describe('getContrastRatio', () => {
    it('returns a ratio for black : white', () => {
      expect(getContrastRatio('#000', '#FFF')).toBe(21);
    });

    it('returns a ratio for black : black', () => {
      expect(getContrastRatio('#000', '#000')).toBe(1);
    });

    it('returns a ratio for white : white', () => {
      expect(getContrastRatio('#FFF', '#FFF')).toBe(1);
    });

    it('returns a ratio for dark-grey : light-grey', () => {
      expect(getContrastRatio('#707070', '#E5E5E5')).toBeCloseTo(3.93, 0.01);
    });

    it('returns a ratio for black : light-grey', () => {
      expect(getContrastRatio('#000', '#888')).toBeCloseTo(5.92, 0.01);
    });
  });

  describe('getLuminance', () => {
    it('returns a valid luminance for rgb black', () => {
      expect(getLuminance('rgba(0, 0, 0)')).toBe(0);
      expect(getLuminance('rgb(0, 0, 0)')).toBe(0);
      expect(getLuminance('color(display-p3 0 0 0)')).toBe(0);
    });

    it('returns a valid luminance for rgb white', () => {
      expect(getLuminance('rgba(255, 255, 255)')).toBe(1);
      expect(getLuminance('rgb(255, 255, 255)')).toBe(1);
      expect(getLuminance('color(display-p3 1 1 1)')).toBe(1);
    });

    it('returns a valid luminance for hsla black', () => {
      expect(getLuminance('hsla(0, 100%, 0%, 1)')).toBe(0);
    });

    it('returns a valid luminance for hsla white', () => {
      expect(getLuminance('hsla(0, 100%, 100%, 1)')).toBe(1);
    });

    it('returns a valid luminance for rgb mid-grey', () => {
      expect(getLuminance('rgba(127, 127, 127)')).toBe(0.212);
      expect(getLuminance('rgb(127, 127, 127)')).toBe(0.212);
    });

    it('returns a valid luminance for an rgb color', () => {
      expect(getLuminance('rgb(255, 127, 0)')).toBe(0.364);
    });

    it('returns a valid luminance from an hsl color', () => {
      expect(getLuminance('hsl(100, 100%, 50%)')).toBe(0.735);
    });

    it('returns a valid luminance from an hsla color', () => {
      expect(getLuminance('hsla(100, 100%, 50%, 1)')).toBe(0.735);
    });

    it('returns an equal luminance for the same color in different formats', () => {
      const hsl = 'hsl(100, 100%, 50%)';
      const rgb = 'rgb(85, 255, 0)';
      expect(getLuminance(hsl)).toBe(getLuminance(rgb));
    });

    it('returns a valid luminance from an CSS4 color', () => {
      expect(getLuminance('color(display-p3 1 1 0.1)')).toBe(0.929);
    });

    it('throw on invalid colors', () => {
      expect(() => {
        getLuminance('black');
      }).toThrow(
        'Dalya: Unsupported CSS color `black`. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().',
      );
    });
  });

  describe('darken', () => {
    it("doesn't modify rgb black", () => {
      expect(darken('rgb(0, 0, 0)', 0.1)).toBe('rgb(0, 0, 0)');
    });

    it("doesn't modify rgb colors when coefficient is 0", () => {
      expect(darken('rgb(255, 255, 255)', 0)).toBe('rgb(255, 255, 255)');
    });

    it("doesn't modify hsl colors when coefficient is 0", () => {
      expect(darken('hsl(0, 100%, 50%)', 0)).toBe('hsl(0, 100%, 50%)');
    });

    it('darkens rgb white to black when coefficient is 1', () => {
      expect(darken('rgb(255, 255, 255)', 1)).toBe('rgb(0, 0, 0)');
    });

    it('retains the alpha value in an rgba color', () => {
      expect(darken('rgb(0, 0, 0, 0.5)', 0.1)).toBe('rgb(0, 0, 0, 0.5)');
    });

    it('darkens rgb white by 10% when coefficient is 0.1', () => {
      expect(darken('rgb(255, 255, 255)', 0.1)).toBe('rgb(229, 229, 229)');
    });

    it('darkens rgb red by 50% when coefficient is 0.5', () => {
      expect(darken('rgb(255, 0, 0)', 0.5)).toBe('rgb(127, 0, 0)');
    });

    it('darkens rgb grey by 50% when coefficient is 0.5', () => {
      expect(darken('rgb(127, 127, 127)', 0.5)).toBe('rgb(63, 63, 63)');
    });

    it('darkens hsl red by 50% when coefficient is 0.5', () => {
      expect(darken('hsl(0, 100%, 50%)', 0.5)).toBe('hsl(0, 100%, 25%)');
    });

    it("doesn't modify hsl colors when l is 0%", () => {
      expect(darken('hsl(0, 50%, 0%)', 0.5)).toBe('hsl(0, 50%, 0%)');
    });

    it('darkens CSS4 color red by 50% when coefficient is 0.5', () => {
      expect(darken('color(display-p3 1 0 0)', 0.5)).toBe('color(display-p3 0.5 0 0)');
    });

    it("doesn't modify CSS4 color when coefficient is 0", () => {
      expect(darken('color(display-p3 1 0 0)', 0)).toBe('color(display-p3 1 0 0)');
    });

    describe('exceptions', () => {
      it('should throw error if an above-range coefficient is supplied', () => {
        expect(() => {
          darken('rgb(0, 127, 255)', 1.5);
        }).toThrow('Dalya: The value provided `1.5` is out of range [`0`, `1`]');
      });

      it('should throw error if a below-range coefficient is supplied', () => {
        expect(() => {
          darken('rgb(0, 127, 255)', -0.1);
        }).toThrow('Dalya: The value provided `-0.1` is out of range [`0`, `1`].');
      });
    });
  });

  describe('lighten', () => {
    it("doesn't modify rgb white", () => {
      expect(lighten('rgb(255, 255, 255)', 0.1)).toBe('rgb(255, 255, 255)');
    });

    it('lightens rgb black to white when coefficient is 1', () => {
      expect(lighten('rgb(0, 0, 0)', 1)).toBe('rgb(255, 255, 255)');
    });

    it('retains the alpha value in an rgba color', () => {
      expect(lighten('rgb(255, 255, 255, 0.5)', 0.1)).toBe('rgb(255, 255, 255, 0.5)');
    });

    it('lightens rgb black by 10% when coefficient is 0.1', () => {
      expect(lighten('rgb(0, 0, 0)', 0.1)).toBe('rgb(25, 25, 25)');
    });

    it('lightens rgb red by 50% when coefficient is 0.5', () => {
      expect(lighten('rgb(255, 0, 0)', 0.5)).toBe('rgb(255, 127, 127)');
    });

    it('lightens rgb grey by 50% when coefficient is 0.5', () => {
      expect(lighten('rgb(127, 127, 127)', 0.5)).toBe('rgb(191, 191, 191)');
    });

    it("doesn't modify rgb colors when coefficient is 0", () => {
      expect(lighten('rgb(127, 127, 127)', 0)).toBe('rgb(127, 127, 127)');
    });

    it('lightens hsl red by 50% when coefficient is 0.5', () => {
      expect(lighten('hsl(0, 100%, 50%)', 0.5)).toBe('hsl(0, 100%, 75%)');
    });

    it("doesn't modify hsl colors when coefficient is 0", () => {
      expect(lighten('hsl(0, 100%, 50%)', 0)).toBe('hsl(0, 100%, 50%)');
    });

    it("doesn't modify hsl colors when `l` is 100%", () => {
      expect(lighten('hsl(0, 50%, 100%)', 0.5)).toBe('hsl(0, 50%, 100%)');
    });

    it('lightens CSS4 color red by 50% when coefficient is 0.5', () => {
      expect(lighten('color(display-p3 1 0 0)', 0.5)).toBe('color(display-p3 1 0.5 0.5)');
    });

    it("doesn't modify CSS4 color when coefficient is 0", () => {
      expect(lighten('color(display-p3 1 0 0)', 0)).toBe('color(display-p3 1 0 0)');
    });

    describe('exceptions', () => {
      it('throws error if an above-range coefficient is supplied', () => {
        expect(() => {
          lighten('rgb(0, 127, 255)', 1.5);
        }).toThrow('Dalya: The value provided `1.5` is out of range [`0`, `1`].');
      });

      it('throws error if a below-range coefficient is supplied', () => {
        expect(() => {
          lighten('rgb(0, 127, 255)', -0.1);
        }).toThrow('Dalya: The value provided `-0.1` is out of range [`0`, `1`].');
      });
    });
  });

  describe('alpha', () => {
    it('converts an rgb color to an rgba color with the value provided', () => {
      expect(alpha('rgb(1, 2, 3)', 0.4)).toBe('rgba(1, 2, 3, 0.4)');
    });

    it('updates an CSS4 color with the alpha value provided', () => {
      expect(alpha('color(display-p3 1 2 3)', 0.4)).toBe('color(display-p3 1 2 3 /0.4)');
    });

    it('updates an rgba color with the alpha value provided', () => {
      expect(alpha('rgba(255, 0, 0, 0.2)', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('converts an hsl color to an hsla color with the value provided', () => {
      expect(alpha('hsl(0, 100%, 50%)', 0.1)).toBe('hsla(0, 100%, 50%, 0.1)');
    });

    it('updates an hsla color with the alpha value provided', () => {
      expect(alpha('hsla(0, 100%, 50%, 0.2)', 0.5)).toBe('hsla(0, 100%, 50%, 0.5)');
    });

    it('throws error on invalid colors', () => {
      expect(() => {
        alpha('white', 0.4);
      }).toThrow(
        'Dalya: Unsupported CSS color `white`. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().',
      );
    });
  });

  describe('emphasize', () => {
    it('lightens a dark rgb color with the coefficient provided', () => {
      expect(emphasize('rgb(1, 2, 3)', 0.4)).toBe(lighten('rgb(1, 2, 3)', 0.4));
    });

    it('darkens a light rgb color with the coefficient provided', () => {
      expect(emphasize('rgb(250, 240, 230)', 0.3)).toBe(darken('rgb(250, 240, 230)', 0.3));
    });

    it('lightens a dark rgb color with the coefficient 0.15 by default', () => {
      expect(emphasize('rgb(1, 2, 3)')).toBe(lighten('rgb(1, 2, 3)', 0.15));
    });

    it('darkens a light rgb color with the coefficient 0.15 by default', () => {
      expect(emphasize('rgb(250, 240, 230)')).toBe(darken('rgb(250, 240, 230)', 0.15));
    });

    it('lightens a dark CSS4 color with the coefficient 0.15 by default', () => {
      expect(emphasize('color(display-p3 0.1 0.1 0.1)')).toBe(
        lighten('color(display-p3 0.1 0.1 0.1)', 0.15),
      );
    });

    it('darkens a light CSS4 color with the coefficient 0.15 by default', () => {
      expect(emphasize('color(display-p3 1 1 0.1)')).toBe(
        darken('color(display-p3 1 1 0.1)', 0.15),
      );
    });
  });

  describe('colorChannel', () => {
    it('converts a short hex color to a color channel', () => {
      expect(colorChannel('#9f3')).toBe('153 255 51');
    });

    it('converts a long hex color to a colorChannel', () => {
      expect(colorChannel('#a94fd3')).toBe('169 79 211');
    });

    it('converts a long alpha hex color to a color channel', () => {
      expect(colorChannel('#111111f8')).toBe('17 17 17');
    });

    it('converts rgb to a color channel', () => {
      expect(colorChannel('rgb(169, 79, 211)')).toBe('169 79 211');
    });

    it('converts rgba to a color channel', () => {
      expect(colorChannel('rgba(255, 11, 13, 0.5)')).toBe('255 11 13');
    });

    it('converts hsl to a color channel', () => {
      expect(colorChannel('hsl(170, 45%, 50%)')).toBe('170 45% 50%');
    });

    it('converts hsla to a color channel', () => {
      expect(colorChannel('hsla(235, 100%, 50%, .5)')).toBe('235 100% 50%');
    });
  });
});
