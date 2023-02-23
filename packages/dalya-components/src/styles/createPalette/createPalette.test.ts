import { deepOrange, dark, light, blue, purple, indigo } from 'dalya-components/colors';
import createPalette from './createPalette';
import { lighten, darken } from 'dalya-system';
import { augmentColor } from './createPaletteUtils';

describe('createPalette', () => {
  it('should create a palette with a rich color object', () => {
    const palette = createPalette({
      primary: deepOrange,
    });

    expect(palette.primary).toMatchObject({
      light: deepOrange[300],
      main: deepOrange[500],
      dark: deepOrange[700],
      contrastText: dark.text.primary,
    });
  });

  it('should create a palette with custom colors', () => {
    const palette = createPalette({
      primary: {
        light: deepOrange[300],
        main: deepOrange[500],
        dark: deepOrange[700],
        contrastText: '#ffffff',
      },
    });

    expect(palette.primary.main).toBe(deepOrange[500]);
    expect(palette.primary.contrastText).toBe('#ffffff');
  });

  it('should create 20% lighter shades from main color and 0.3% darker shades from main color if not provided', () => {
    const palette = createPalette({
      primary: { main: deepOrange[500] },
    });

    expect(palette.primary).toMatchObject({
      main: deepOrange[500],
      light: lighten(deepOrange[500], 0.2),
      dark: darken(deepOrange[500], 0.3),
    });
  });

  it('should calculate light and dark colors using a simple tonalOffset number value', () => {
    const palette = createPalette({
      primary: { main: deepOrange[500] },
      tonalOffset: 0.1,
    });

    expect(palette.primary).toMatchObject({
      main: deepOrange[500],
      light: lighten(deepOrange[500], 0.1),
      dark: darken(deepOrange[500], 0.15),
    });
  });

  it('should calculate light and dark colors using a custom tonalOffset object value', () => {
    const palette = createPalette({
      primary: { main: deepOrange[500] },
      tonalOffset: {
        light: 0.8,
        dark: 0.5,
      },
    });

    expect(palette.primary).toMatchObject({
      main: deepOrange[500],
      light: lighten(deepOrange[500], 0.8),
      dark: darken(deepOrange[500], 0.5),
    });
  });

  it('should calculate contrastText using the provided contrastThreshold', () => {
    const palette = createPalette({ contrastThreshold: 7 });
    expect(palette.primary.contrastText).toBe(light.text.primary);
    expect(palette.secondary.contrastText).toBe(light.text.primary);
  });

  it('should create a dark palette', () => {
    const palette = createPalette({ mode: 'dark' });
    expect(palette.primary.main).toBe(blue[200]);
    expect(palette.secondary.main).toBe(purple[200]);
    expect(palette.text).toBe(dark.text);
  });

  it('should create a palette with unique object references', () => {
    const redPalette = createPalette({ background: { paper: 'red' } });
    const bluePalette = createPalette({ background: { paper: 'blue' } });

    expect(redPalette).not.toStrictEqual(bluePalette);
    expect(redPalette.background).not.toStrictEqual(bluePalette.background);
  });

  describe('warnings', () => {
    const logErrorSpy = jest.spyOn(console, 'error');

    it('logs an error when an invalid mode is specified', () => {
      // @ts-ignore
      createPalette({ mode: 'foo' });
      expect(logErrorSpy).toHaveBeenCalledWith('Dalya: The palette mode `foo` is not supported');
    });

    it('logs an error when a wrong color property is provided', () => {
      // @ts-ignore
      createPalette({ primary: '#fff' });
      expect(logErrorSpy).toHaveBeenCalledWith(
        'DalyaError: Dalya: The color (primary) provided to augmentColor(color) is invalid. The color object needs to have color.main or color[500] value',
      );

      // @ts-ignore
      createPalette({ primary: { main: { foo: 'bar' } } });
      expect(logErrorSpy).toHaveBeenCalledWith(
        'DalyaError: Dalya: The color (primary) provided to augmentColor(color) is invalid. color.main should be a string type, but {{"foo":"bar"}} was provided instead',
      );

      // @ts-ignore
      createPalette({ primary: { main: undefined } });
      expect(logErrorSpy).toHaveBeenCalledWith(
        'DalyaError: Dalya: The color (primary) provided to augmentColor(color) is invalid. The color object needs to have color.main or color[500] value',
      );
    });

    it('logs an error when the contrast ratio does not reach 3:1', () => {
      const { getContrastText } = createPalette({
        contrastThreshold: 0,
      });

      getContrastText('#fefefe');

      expect(logErrorSpy).toHaveBeenCalledWith(
        [
          `Dalya: The contrast ratio of 1.0086455331412105: 1 for #fff on #fefefe`,
          'falls below the WCAG recommneded absolute minimum contrast ratio of 3:1.',
          'https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast',
        ].join('\n'),
      );
    });
  });

  describe('augmentColor', () => {
    const palette = createPalette({});

    it('should accept a color', () => {
      const color1 = palette.augmentColor({ color: indigo, name: 'primary' });

      expect(color1).toMatchObject({
        dark: '#303f9f', // 700
        light: '#7986cb', // 300
        main: '#3f51b5', // 500
        contrastText: '#fff',
      });

      const color2 = palette.augmentColor({
        color: indigo,
        mainShade: 400,
        lightShade: 200,
        darkShade: 600,
        name: 'indigo',
      });

      expect(color2).toMatchObject({
        light: '#9fa8da', // 200
        main: '#5c6bc0', // 400
        dark: '#3949ab', // 600
        contrastText: '#fff',
      });
    });

    it('should accept a partial palette color', () => {
      const color = palette.augmentColor({
        color: {
          main: indigo[500],
        },
        name: 'indigo',
      });
      expect(color).toMatchObject({
        light: 'rgb(101, 115, 195)',
        main: '#3f51b5',
        dark: 'rgb(44, 56, 126)',
        contrastText: '#fff',
      });
    });

    describe('exceptions', () => {
      it('should throw an error for missing `main` field in color object', () => {
        expect(() => {
          augmentColor({
            // @ts-ignore
            color: { light: indigo[200] },
            name: 'indigo',
          });
        }).toThrow(
          'Dalya: The color (indigo) provided to augmentColor(color) is invalid. The color object needs to have color.main or color[500] value',
        );
      });

      it('should throw an error for non string type color.main value', () => {
        expect(() => {
          augmentColor({
            color: {
              // @ts-ignore
              main: 123,
            },
            name: 'indigo',
          });
        }).toThrow(
          'Dalya: The color (indigo) provided to augmentColor(color) is invalid. color.main should be a string type, but {123} was provided instead',
        );
      });

      it('should throw an error for missing color[500] value', () => {
        expect(() => {
          augmentColor({
            color: {
              100: '#fff',
              200: '#000',
            },
            name: 'indigo',
          });
        }).toThrow(
          'Dalya: The color (indigo) provided to augmentColor(color) is invalid. The color object needs to have color.main or color[500] value',
        );
      });
    });
  });

  describe('getPaletteColor', () => {
    it('should be able to assign custom color fields', () => {
      const palette = createPalette({
        customColors: [
          {
            indigo,
          },
        ],
      });

      expect(palette.getPaletteColor('indigo')).toEqual({
        contrastText: '#fff',
        dark: '#303f9f',
        light: '#7986cb',
        main: '#3f51b5',
      });
    });

    it('should be able to get default color', () => {
      const palette = createPalette({});

      const primaryDefault = {
        main: blue[700],
        light: blue[400],
        dark: blue[800],
      };

      expect(palette.getPaletteColor('primary')).toEqual({
        ...primaryDefault,
        contrastText: '#fff',
      });
    });
  });
});
