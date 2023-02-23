import capitalize from './capitalize';

describe('capitalize', () => {
  it('capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('throws an exception when argument is not string type', () => {
    const errorSpy = jest.spyOn(console, 'error');
    capitalize(123);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
