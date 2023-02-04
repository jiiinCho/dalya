import propsToClassKey from './propsToClassKey';

describe('propsToClassKey', () => {
  it('should return the variant value as string', () => {
    expect(propsToClassKey({ variant: 'custom' })).toBe('custom');
  });

  it('should combine the variant with other props', () => {
    expect(propsToClassKey({ variant: 'custom', size: 'large' })).toBe('customSizeLarge');
  });

  it('should append the props after the varaint in alphabetical order', () => {
    expect(propsToClassKey({ variant: 'custom', size: 'large', mode: 'static' })).toBe(
      'customModeStaticSizeLarge',
    );
  });

  it('should not prefix the color prop', () => {
    expect(propsToClassKey({ variant: 'custom', color: ' primary' })).toBe('customPrimary');
  });

  it('should work without variant in props', () => {
    expect(propsToClassKey({ color: 'primary', size: 'large', mode: 'static' })).toBe(
      'primaryModeStaticSizeLarge',
    );
  });

  it('should not capitalize the first prop', () => {
    expect(propsToClassKey({ size: 'large', zIndex: 'toolbar' })).not.toBe(
      'SizeLargeZindexToolBar',
    );
  });
});
