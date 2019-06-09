// @flow

export const trunc = (s: string, n: number) => (s.length > n ? `${s.substr(0, n - 1)}...` : s);
