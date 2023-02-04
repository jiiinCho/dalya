/**
 * WARNING: Don't import this directly
 * Use `DalyaError` from `dalya-utils/macros/DalyaError.macro` instead
 * @param {number} code
 */

export default function formatDalyaErrorMessage(code: number): string {
  // Apply babel-plugin-transform-template in loose mode
  // loose mode is safe if we're concatenating primitives
  // eslint-disable-next-line prefer-template
  return 'ToDo: prepare url to display detailed error code for' + code;
}
