import createBreakpoints from './createBreakpoints';

describe('createBreakpoints', () => {
  const breakpoints = createBreakpoints({});

  it('should sort values in ascending order', () => {
    const orderedValues = createBreakpoints({
      values: {
        xs: 0,
        sm: 640,
        md: 1024,
        lg: 1280,
        xl: 1560,
      },
    });

    const unorderedValues = createBreakpoints({
      values: {
        xs: 0,
        sm: 640,
        md: 1024,
        xl: 1560,
        lg: 1280,
      },
    });

    expect(unorderedValues.keys).toStrictEqual(orderedValues.keys);
    expect(unorderedValues.values).toStrictEqual(orderedValues.values);
  });

  describe('up', () => {
    it('should work for xs', () => {
      expect(breakpoints.up('xs')).toBe('@media (min-width:0px)');
    });

    it('should work for md', () => {
      expect(breakpoints.up('md')).toBe('@media (min-width:900px)');
    });

    it('should work for lg', () => {
      expect(breakpoints.up('lg')).toBe('@media (min-width:1200px)');
    });

    it('should work for xl', () => {
      expect(breakpoints.up('xl')).toBe('@media (min-width:1536px)');
    });
  });

  describe('down', () => {
    it('should work for xs', () => {
      expect(breakpoints.down('xs')).toBe('@media (max-width:-0.05px)');
    });

    it('should work for sm', () => {
      expect(breakpoints.down('sm')).toBe('@media (max-width:599.95px)');
    });

    it('should work for md', () => {
      expect(breakpoints.down('md')).toBe('@media (max-width:899.95px)');
    });

    it('should work for xl', () => {
      expect(breakpoints.down('xl')).toBe('@media (max-width:1535.95px)');
    });
  });

  describe('between', () => {
    it('should work for between sm and md', () => {
      expect(breakpoints.between('sm', 'md')).toBe(
        '@media (min-width:600px) and (max-width:899.95px)',
      );
    });

    it('should work on largest breakpoint', () => {
      expect(breakpoints.between('lg', 'xl')).toBe(
        '@media (min-width:1200px) and (max-width:1535.95px)',
      );
    });
  });

  describe('only', () => {
    it('should work for md', () => {
      expect(breakpoints.only('md')).toBe('@media (min-width:900px) and (max-width:1199.95px)');
    });

    it('on xl should call up', () => {
      expect(breakpoints.only('xl')).toBe('@media (min-width:1536px)');
    });
  });

  describe('not', () => {
    it('on xs should call up(sm)', () => {
      expect(breakpoints.not('xs')).toBe('@media (min-width:600px)');
    });

    it('on xl should call down(xl)', () => {
      expect(breakpoints.not('xl')).toBe('@media (max-width:1535.95px)');
    });

    it('should work for md', () => {
      expect(breakpoints.not('md')).toBe(
        '@media not all and (min-width:900px) and (max-width:1199.95px)',
      );
    });
  });
});
