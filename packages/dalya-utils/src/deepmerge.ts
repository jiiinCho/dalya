export function isPlainObject(item: unknown): item is Record<keyof any, unknown> {
  return item !== null && typeof item === 'object' && item.constructor === Object;
}

function deepClone<T>(source: T): T | Record<keyof any, unknown> {
  // if source is not plain object, can be primitive types -- return as it is
  if (!isPlainObject(source)) {
    return source;
  }

  const output: Record<keyof any, unknown> = {};

  // create copy object from source
  Object.keys(source).forEach((key) => {
    output[key] = deepClone(source[key]);
  });

  return output;
}

export interface DeepmergeOptions {
  clone?: boolean;
}

// deepmerge is to merge source object to target object
// and return target
function deepmerge<T>(target: T, source: unknown, options: DeepmergeOptions = { clone: true }): T {
  const output = options.clone ? { ...target } : target;

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      // Avoid prototype pollution
      if (key === '__proto__') {
        return;
      }

      if (isPlainObject(source[key]) && key in target && isPlainObject(target[key])) {
        // Since 'output' is a clone of 'target' and we have narrowed 'target' in this block we can cast the same type
        (output as Record<keyof any, unknown>)[key] = deepmerge(target[key], source[key], options);
      } else if (options.clone) {
        (output as Record<keyof any, unknown>)[key] = isPlainObject(source[key])
          ? deepClone(source[key])
          : source[key];
      } else {
        (output as Record<keyof any, unknown>)[key] = source[key];
      }
    });
  }

  return output;
}

export default deepmerge;
