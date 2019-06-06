// @flow
import { get } from 'lodash';
import { store } from 'redux/store';

const localDev = true;
export const API_BASE = localDev ? 'http://en.se:3000' : 'https://api.ense.nyc';
// await fetch(url, {})
export const CLIENT_ID = 'PfE36O4PtvqmtPZf9VCXaf3D00GBGVGwn8VsPVqBLUy88POt';

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
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...extraHeaders,
      Authorization,
    },
  })
    .then(_deserialize)
    .catch(console.error);
};

export const $post = (
  path: string,
  params: ?Object,
  extraOptions?: Object,
  extraHeaders?: Object
): Promise<any> => {
  const deviceSecretKey = get(store.getState(), 'deviceSecretKey');
  const Authorization = `bearer ${deviceSecretKey}`;
  const body = params && { body: formData(params) };
  const options = {
    ...extraOptions,
    method: 'POST',
    // headers: {
    // Accept: 'application/json',
    // 'Content-Type': 'multipart/form-data',
    // 'Content-Type': 'application/json',
    // ...extraHeaders,
    // ...(deviceSecretKey && { Authorization }),
    // },
    ...body,
  };
  const url = urlFor(path);
  console.log(url, options);
  return fetch(url, options)
    .then(_deserialize)
    .catch(console.error);
};

const queryString = (params: Object): string => {
  const kv = [];
  Object.keys(params).forEach(key => {
    kv.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  });
  return kv.join('&');
};

const formData = (params: Object): FormData => {
  const fd = new FormData();
  Object.keys(params).forEach(key => fd.append(key, params[key]));
  return fd;
};

const _deserialize = (r: Response): any =>
  r.headers.get('content-type').includes('json') ? r.json() : r.text();
