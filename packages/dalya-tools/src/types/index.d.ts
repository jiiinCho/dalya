// disable automatic export
// https://stackoverflow.com/questions/52583603/intentional-that-export-shuts-off-automatic-export-of-all-symbols-from-a-ty
export {};

/**
 * T = { foo: true }
 * [Key in keyof T] => Key is foo
 * true extends T[Key] => if T[foo] is true then {[Key in keyof T]: Key}[keyof T] => {foo: foo}[foo] => 'foo'
 * Extract<'foo', string> => 'foo'
 */
type GenerateStringUnion<T> = Extract<
  { [Key in keyof T]: true extends T[Key] ? Key : never }[keyof T],
  string
>;

/**
 * Remove properties `K` from `T`
 * Distributive for union types, default Omit does not work on union type
 */
type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/**
 * Overwrite U onto T
 */
type Overwrite<T, U> = DistributiveOmit<T, keyof U> & U;

/**
 * A. Record<T, true> => { T : true }
 * B. Overwrite<{T: true}, U> => if keyof U is same as T, result object will be overwritted to U value
 * OverridableStringUnion will be string union consists of keyof B
 */

export type OverridableStringUnion<T extends string, U = object> = GenerateStringUnion<
  Overwrite<Record<T, true>, U>
>;
