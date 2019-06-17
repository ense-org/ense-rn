// @flow

export type ArrayOrSingle<T> = T | T[];
export const asArray = <T>(v: ArrayOrSingle<T>): $ReadOnlyArray<T> => (Array.isArray(v) ? v : [v]);
