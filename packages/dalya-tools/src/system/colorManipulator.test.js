import { recomposeColor } from 'dalya-system';

describe('colorManipulator', () => {
  describe('recomposeColor', () => {
    it('converts a decomposed rgb color object to a string', () => {
      const mockColor = {
        type: 'rgb',
        values: [255, 255, 255],
      };

      expect(recomposeColor(mockColor)).toBe('rgb(255, 255, 255)');
    });
  });
});
