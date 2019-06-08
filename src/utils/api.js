// @flow
import { get } from 'lodash';
import { store } from 'redux/store';
import FD from './FormData';

const localDev = false;
export const API_BASE = localDev ? 'http://en.se:3000' : 'https://api.ense.nyc';
export const CLIENT_ID = 'PfE36O4PtvqmtPZf9VCXaf3D00GBGVGwn8VsPVqBLUy88POt';

export const urlFor = (path: string): string => `${API_BASE}${path}`;

export const $get = <T: Object>(
  path: string,
  params: ?Object,
  extraOptions?: Object,
  extraHeaders?: Object
): Promise<T> => {
  const qs = params ? `?${queryString(params)}` : '';
  return fetch(urlFor(path) + qs, {
    ...extraOptions,
    method: 'GET',
    headers: { ...extraHeaders, ...getAuth() },
  })
    .then(checkStatus)
    .then(deserialize);
};

export const $post = (
  path: string,
  params: ?Object,
  extraOptions?: Object,
  extraHeaders?: Object
): Promise<any> => {
  const body = params && { body: formData(params) };
  const options = {
    ...extraOptions,
    method: 'POST',
    headers: {
      ...extraHeaders,
      ...getAuth(),
    },
    ...body,
  };
  const url = urlFor(path);
  return fetch(url, options)
    .then(checkStatus)
    .then(deserialize);
};

const queryString = (params: Object): string => {
  const kv = [];
  Object.keys(params).forEach(key => {
    kv.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  });
  return kv.join('&');
};

const formData = (params: Object): FD => {
  const fd = new FD();
  Object.keys(params).forEach(key => fd.append(key, params[key]));
  return fd;
};

const deserialize = (r: Response): any =>
  r.headers.get('content-type').includes('json') ? r.json() : r.text();

const getAuth = (): ?{ Authorization: string } => {
  const deviceSecretKey = get(store.getState(), 'deviceSecretKey');
  const Authorization = `bearer ${deviceSecretKey}`;
  return deviceSecretKey && { Authorization };
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}
