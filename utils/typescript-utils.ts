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
