// @flow
import { sample } from 'lodash';

export const trunc = (s: string, n: number) => (s.length > n ? `${s.substr(0, n - 1)}...` : s);
export const truncAry = (s: string, n: number) =>
  [...s].length > n ? `${[...s].slice(0, n).join('')}` : s;

/* eslint-disable  */
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
/* eslint-disable  */

const colorCodes = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
export const genColorCode = () => sample(colorCodes) + sample(colorCodes) + sample(colorCodes);

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
  if (count < 1e3) {
    return count;
  } else if (count < 1e6) {
    return `${(count / 1e3).toFixed(1).replace(/\.0/, '')}K`;
  } else if (count < 1e9) {
    return `${(count / 1e6).toFixed(1).replace(/\.0/, '')}B`;
  }
  return '>1B';
};

export const formatPhone = (partial: ?string) => {
  if (!partial) return '';
  let phone = partial.replace(/\D/g, '');
  const match = phone.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    phone = `${match[1]}${match[2] ? ' ' : ''}${match[2]}${match[3] ? '-' : ''}${match[3]}`;
  }
  return phone;
};

export const renderShortUrl = (url, matches) => {
  if (!matches) {
    return url;
  }
  const [o, proto, domain, path] = matches;
  if (domain && path) {
    return `${domain}${trunc(path, 8)}`;
  }
  return o;
};
