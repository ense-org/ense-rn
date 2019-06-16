// @flow
import { sample } from 'lodash';

export const trunc = (s: string, n: number) => (s.length > n ? `${s.substr(0, n - 1)}...` : s);

/* eslint-disable  */
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
/* eslint-disable  */

const colorCodes = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
export function genColorCode() {
  return sample(colorCodes) + sample(colorCodes) + sample(colorCodes);
}

export const filenameFrom = (uri: string): string =>
  uri
    .split('\\')
    .pop()
    .split('/')
    .pop();

/**
 * Used to display counts, like followers or # of enses
 */
export const displayCount = (count: ?number) => {
  if (typeof count !== 'number') {
    return '';
  }
  if (count < 1000) {
    return count;
  } else if (count < 1000000) {
    return `${count / 1000}K`;
  } else if (count < 1000000000) {
    return `${count / 1000000}B`;
  }
  return '>1B';
};
