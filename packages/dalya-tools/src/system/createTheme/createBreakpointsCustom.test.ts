import createBreakpoints from './createBreakpoints';

declare module './createBreakpoints' {
  interface BreakpointOverrides {
    xs: false; // removes the `xs` breakpoint
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true; // adds the `mobile` breakpoint
    tablet: true;
    laptop: true;
    desktop: true;
  }
}

describe('createBreakpointsCustom', () => {
  it('should sort values in ascending order', () => {
    const orderedValues = createBreakpoints({
      values: {
        mobile: 0,
        tablet: 640,
        laptop: 1024,
        desktop: 1280,
      },
    });

    const unorderedValues = createBreakpoints({
      values: {
        desktop: 1280,
        mobile: 0,
        laptop: 1024,
        tablet: 640,
      },
    });

    expect(unorderedValues.keys).toStrictEqual(orderedValues.keys);
    expect(unorderedValues.values).toStrictEqual(orderedValues.values);
  });

  describe('customBreakpoints', () => {
    const customBreakpoints = createBreakpoints({
      values: {
        mobile: 0,
        tablet: 640,
        laptop: 1024,
        desktop: 1280,
      },
    });

    describe('up', () => {
      it('should work for mobile', () => {
        expect(customBreakpoints.up('mobile')).toBe('@media (min-width:0px)');
      });

      it('should work for tablet', () => {
        expect(customBreakpoints.up('tablet')).toBe('@media (min-width:640px)');
      });

      it('should work for laptop', () => {
        expect(customBreakpoints.up('laptop')).toBe('@media (min-width:1024px)');
      });

      it('should work for desktop', () => {
        expect(customBreakpoints.up('desktop')).toBe('@media (min-width:1280px)');
      });
    });

    describe('down', () => {
      it('should work for mobile', () => {
        expect(customBreakpoints.down('mobile')).toBe('@media (max-width:-0.05px)');
      });

      it('should work for tablet', () => {
        expect(customBreakpoints.down('tablet')).toBe('@media (max-width:639.95px)');
      });

      it('should work for laptop', () => {
        expect(customBreakpoints.down('laptop')).toBe('@media (max-width:1023.95px)');
      });

      it('should work for desktop', () => {
        expect(customBreakpoints.down('desktop')).toBe('@media (max-width:1279.95px)');
      });
    });

    describe('between', () => {
      it('should work for custom breakpoints', () => {
        expect(customBreakpoints.between('mobile', 'tablet')).toBe(
          '@media (min-width:0px) and (max-width:639.95px)',
        );
      });

      it('should work for largest breakpoint', () => {
        expect(customBreakpoints.between('laptop', 'desktop')).toBe(
          '@media (min-width:1024px) and (max-width:1279.95px)',
        );
      });
    });

    describe('only', () => {
      it('should work for mobile', () => {
        expect(customBreakpoints.only('mobile')).toBe(
          '@media (min-width:0px) and (max-width:639.95px)',
        );
      });

      it('on desktop should call up', () => {
        expect(customBreakpoints.only('desktop')).toBe('@media (min-width:1280px)');
      });
    });

    describe('not', () => {
      it('on mobile should call up(tablet)', () => {
        expect(customBreakpoints.not('mobile')).toBe('@media (min-width:640px)');
      });

      it('on desktop should call down(desktop)', () => {
        expect(customBreakpoints.not('desktop')).toBe('@media (max-width:1279.95px)');
      });

      it('should work for tablet', () => {
        expect(customBreakpoints.not('tablet')).toBe(
          '@media not all and (min-width:640px) and (max-width:1023.95px)',
        );
      });
    });
  });
});
