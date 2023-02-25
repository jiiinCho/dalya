import ClassNameGenerator from './ClassNameGenerator';
import generateUtilityClass from '../generateUtilityClass';

describe('ClassNameGenerator', () => {
  afterEach(() => {
    ClassNameGenerator.reset();
  });

  it('sets custom generator globally', () => {
    const generator = (name: string) => `foo-bar-${name}`;
    ClassNameGenerator.configure(generator);

    expect(generateUtilityClass('Foo', 'slot')).toBe('foo-bar-Foo-slot');
  });

  it('does not affect state class', () => {
    const generator = (name: string) => `foo-bar-${name}`;
    ClassNameGenerator.configure(generator);

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

  it('can assign custom state prefix', () => {
    expect(generateUtilityClass('JoyButton', 'focusVisible', 'Joy')).toBe('Joy-focusVisible');
  });
});
