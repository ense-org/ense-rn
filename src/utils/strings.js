/* eslint-disable no-bitwise */
// @flow

export const trunc = (s: string, n: number) => (s.length > n ? `${s.substr(0, n - 1)}...` : s);

export const uuidv4 = (): string =>
  // $FlowIgnore
  String([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    // $FlowIgnore
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
