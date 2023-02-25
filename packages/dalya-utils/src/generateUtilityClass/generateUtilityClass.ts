import ClassNameGenerator from '../ClassNameGenerator';
import { isStateClass } from '../consts';

function generateUtilityClass(
  componentName: string,
  slot: string,
  globalStatePrefix = 'Dalya',
): string {
  return isStateClass(slot)
    ? `${globalStatePrefix}-${slot}`
    : `${ClassNameGenerator.generate(componentName)}-${slot}`;
}

export default generateUtilityClass;
