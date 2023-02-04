/**
 * @jest-environment jsdom
 */
import deepmerge from './deepmerge';

describe('deepmerge', () => {
  it('should not be subject to prototype pollution', () => {
    const mergedObjectWithProto = deepmerge(
      {},
      JSON.parse('{"myProperty" : "a", "__proto__": {"isAdmin": true}}'),
      {
        clone: false,
      },
    );
    expect(mergedObjectWithProto).not.toHaveProperty('__proto__.isAdmin');
  });

  it('should work', () => {
    const mergedObject = deepmerge(
      {},
      JSON.parse('{"myProperty" : "a", "auth": {"isAdmin": true}}'),
    );
    expect(mergedObject).toHaveProperty('auth.isAdmin');
  });

  it('should not merge HTML elements', () => {
    const divElement = document.createElement('div');
    const spanElement = document.createElement('span');

    const mergedHTML = deepmerge({ element: divElement }, { element: spanElement });

    expect(mergedHTML.element).toBe(spanElement); // keep source
  });

  it('should work', () => {
    const result = deepmerge(
      {
        '&.Dalya-disabled': {
          color: 'red',
        },
      },
      {
        '&.Dalya-disabled': {
          color: 'green',
        },
      },
    );
    expect(result).toStrictEqual({
      '&.Dalya-disabled': {
        color: 'green',
      },
    });
  });

  it('should reset when target is undefined', () => {
    const result = deepmerge(
      {
        '&.Dalya-disabled': undefined,
      },
      {
        '&.Dalya-disabled': {
          color: 'red',
        },
      },
    );

    expect(result).toStrictEqual({
      '&.Dalya-disabled': {
        color: 'red',
      },
    });
  });

  it('should merge keys that do not exist in source', () => {
    const result = deepmerge(
      {
        foo: {
          baz: 'target',
        },
      },
      {
        foo: { bar: 'source' },
        bar: 'source-bar',
      },
    );

    expect(result).toStrictEqual({
      foo: { baz: 'target', bar: 'source' },
      bar: 'source-bar',
    });
  });

  it('should deep clone source key object if targe key does not exist', () => {
    const foo = { foo: { baz: 'test' } };
    const bar = {};

    const result = deepmerge(bar, foo);
    expect(result).toStrictEqual(foo);

    // @ts-ignore
    result.foo.baz = 'new test';

    expect(result).toStrictEqual({ foo: { baz: 'new test' } });
    expect(foo).toStrictEqual({ foo: { baz: 'test' } });
  });
});
