import DalyaError from './DalyaError';

// This function is not equivalent to `text-transform: capitalize`
function capitalize(string: string): string {
  if (typeof string !== 'string') {
    throw new DalyaError('Dalya: `capitalize(string)` expects a string argument.');
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default capitalize;
