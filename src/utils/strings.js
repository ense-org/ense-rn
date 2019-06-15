/* eslint-disable  */
// @flow

export const trunc = (s: string, n: number) => (s.length > n ? `${s.substr(0, n - 1)}...` : s);

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
