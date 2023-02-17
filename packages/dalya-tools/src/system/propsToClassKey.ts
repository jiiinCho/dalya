import { capitalize } from 'dalya-utils';

function isEmpty(string: string): boolean {
  return string.length === 0;
}

function removeWhiteSpaces(string: string): string {
  return string.replace(/\s/g, '');
}

/**
 * Generates string classKey based on the properties provided. It starts with the
 * variant if defined, and then it appends all other properties in alphabetical order
 * @param props - the properties for which the classKey should be created
 */
function propsToClassKey(props: Record<keyof any, unknown>): string {
  const { variant, ...other } = props;
  let classKey = typeof variant === 'string' ? variant : '';

  Object.keys(other)
    .sort()
    .forEach((key) => {
      const propertyValue = props[key];

      if (typeof propertyValue === 'string' && typeof classKey === 'string') {
        const value = removeWhiteSpaces(propertyValue);

        if (key === 'color') {
          classKey += isEmpty(classKey) ? value : capitalize(value);
        } else {
          classKey += `${isEmpty(classKey) ? key : capitalize(key)}${capitalize(value)}`;
        }
      }
    });

  return classKey;
}

export default propsToClassKey;
