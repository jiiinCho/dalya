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
  });

  describe('augmentColor', () => {
    const palette = createPalette({});

    it('should accept a color', () => {
      const color1 = palette.augmentColor({ color: indigo, name: 'primary' });
      expect(color1).toMatchObject({
        dark: '#303f9f',
        light: '#7986cb',
        main: '#3f51b5',
        contrastText: '#fff',
      });

      const color2 = palette.augmentColor({
        color: indigo,
        name: 'primary',
        mainShade: 400,
        lightShade: 200,
        darkShade: 600,
      });
      expect(color2).toMatchObject({
        light: '#9fa8da',
        main: '#5c6bc0',
        dark: '#3949ab',
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
            color: {},
            name: 'indigo',
          });
        }).toThrow('Error');
      });

      it('should throw an error for wrong color values', () => {
        expect(
          augmentColor({
            color: {
              main: 'foo',
            },
            name: 'indigo',
          }),
        ).toThrow('Error');
      });
    });
  });

  /*

   it('should create a palette with unique object references', () => {
    const redPalette = createPalette({ background: { paper: 'red' } });
    const bluePalette = createPalette({ background: { paper: 'blue' } });
    expect(redPalette).not.to.equal(bluePalette);
    expect(redPalette.background).not.to.equal(bluePalette.background);
  });

  describe('warnings', () => {
    it('throws an exception when an invalid mode is specified', () => {
      expect(() => {
        createPalette({ mode: 'foo' });
      }).toErrorDev('MUI: The palette mode `foo` is not supported');
    });

    it('throws an exception when a wrong color is provided', () => {
      expect(() => createPalette({ primary: '#fff' })).toThrowMinified(
        [
          'MUI: The color (primary) provided to augmentColor(color) is invalid.',
          'The color object needs to have a `main` property or a `500` property.',
        ].join('\n'),
      );
      expect(() => createPalette({ primary: { main: { foo: 'bar' } } })).toThrowMinified(
        [
          'MUI: The color (primary) provided to augmentColor(color) is invalid.',
          '`color.main` should be a string, but `{"foo":"bar"}` was provided instead.',
        ].join('\n'),
      );
      expect(() => createPalette({ primary: { main: undefined } })).toThrowMinified(
        [
          'MUI: The color (primary) provided to augmentColor(color) is invalid.',
          '`color.main` should be a string, but `undefined` was provided instead.',
        ].join('\n'),
      );
    });

    it('logs an error when the contrast ratio does not reach AA', () => {
      let getContrastText;
      expect(() => {
        ({ getContrastText } = createPalette({
          contrastThreshold: 0,
        }));
      }).not.toErrorDev();

      expect(() => {
        getContrastText('#fefefe');
      }).toErrorDev('falls below the WCAG recommended absolute minimum contrast ratio of 3:1');
    });
  });

  */
});
