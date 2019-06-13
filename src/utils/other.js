// @flow

// eslint-disable-next-line no-undef
export const asArray = <T>(v: T | T[]): $ReadOnlyArray<T> => (Array.isArray(v) ? v : [v]);
