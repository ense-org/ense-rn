// @flow
import { get } from 'lodash';
import { store } from '../redux/store';

export const API_BASE = 'https://api.ense.nyc';

const CLIENT_ID = 'PfE36O4PtvqmtPZf9VCXaf3D00GBGVGwn8VsPVqBLUy88POt';

export const urlFor = (path: string): string => `${API_BASE}${path}`;

export const $get = <T: Object>(
  path: string,
  params: ?Object,
  extraOptions?: Object,
  extraHeaders?: Object
): Promise<T> => {
  const deviceSecretKey = get(store.getState(), 'deviceSecretKey', '');
  const qs = params ? `?${queryString(params)}` : '';
  const Authorization = `bearer ${deviceSecretKey}`;

  return fetch(urlFor(path) + qs, {
    ...extraOptions,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
      Authorization,
    },
  });
};

export const $post = <T: Object>(
  path: string,
  body: ?Object = undefined,
  extraOptions?: Object = undefined,
  extraHeaders?: Object = undefined
): Promise<T> => {
  const deviceSecretKey = get(store.getState(), 'deviceSecretKey', '');
  const Authorization = `bearer ${deviceSecretKey}`;

  return fetch(urlFor(path), {
    ...extraOptions,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
      Authorization,
    },
    body,
  }).then(r => r.json());
};

const queryString = (params: Object): string => {
  const kv = [];
  Object.keys(params).forEach(key => {
    kv.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  });
  return kv.join('&');
};
