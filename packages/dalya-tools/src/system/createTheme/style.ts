// getPath function returns value of obj[path]
export function getPath<T extends Record<string, any>>(
  obj: T,
  path: string | undefined,
  checkVars = true,
): null | unknown {
  if (!path || typeof path !== 'string') {
    return null;
  }

  // Check if CSS variables are used
  if (obj && obj.vars && checkVars) {
    const val = `vars.${path}`
      .split('.')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .reduce((acc, item) => (acc && acc[item] ? acc[item] : null), obj);
    // acc && acc[item] will filter falsy condition on acc[item]
    // falsy condition includes empty string

    // if val is undefined or null
    // it goes to final return path.split('.')
    // so this function will return default theme[themeKey] value
    if (val != null) {
      // not undefined, null or NaN
      return val;
    }
  }

  return path.split('.').reduce((acc, item) => {
    // acc[item] != null is true if acc[item] is empty string, 0 and false
    if (acc && acc[item] != null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return acc[item];
    }
    return null;
  }, obj);
}

function style() {
  return 'TODO';
}

export default style;
