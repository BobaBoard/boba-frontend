/**
 * Extracts the type of Props from the given component type
 */
export type GetProps<C extends React.FC<any>> = C extends React.FC<infer T>
  ? T
  : any;

/**
 * Extracts the type of Props from the given component type, if the component
 * is a forwarded ref.
 */
export type GetPropsFromForwardedRef<
  C extends React.ForwardRefExoticComponent<unknown>
> = C extends React.ForwardRefExoticComponent<infer T>
  ? T extends React.RefAttributes<infer Q>
    ? Omit<T, keyof Q>
    : unknown
  : unknown;

/**
 * Type-safe function to remove null or undefined values from an array
 * through array.filter(isNotNull).
 */
export const isNotNull = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Turns all the boolean values in the given object to false.
 */
export type AllFalse<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends boolean ? false : T[K];
};

/**
 * Expands object types recursively, thus making the resulting type
 * more readable. Doesn't actually change the type.
 */
export type MakeRecursiveTypeReadable<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: MakeRecursiveTypeReadable<O[K]> }
    : never
  : T;
