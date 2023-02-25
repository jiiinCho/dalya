import generateUtilityClass from './generateUtilityClass';

describe('generateUtilityClass', () => {
  it('should generate class name correctly', () => {
    expect(generateUtilityClass('Foo', 'slot')).toBe('Foo-slot');
  });

  it('should generate state class', () => {
    expect(generateUtilityClass('Foo', 'active')).toBe('Dalya-active');
    expect(generateUtilityClass('Foo', 'checked')).toBe('Dalya-checked');
    expect(generateUtilityClass('Foo', 'disabled')).toBe('Dalya-disabled');
    expect(generateUtilityClass('Foo', 'error')).toBe('Dalya-error');
    expect(generateUtilityClass('Foo', 'focused')).toBe('Dalya-focused');
    expect(generateUtilityClass('Foo', 'focusVisible')).toBe('Dalya-focusVisible');
    expect(generateUtilityClass('Foo', 'required')).toBe('Dalya-required');
    expect(generateUtilityClass('Foo', 'expanded')).toBe('Dalya-expanded');
    expect(generateUtilityClass('Foo', 'selected')).toBe('Dalya-selected');
  });
});
