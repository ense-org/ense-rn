// @flow
import { get } from 'lodash';
import FD from 'utils/FormData';
import routes from './routes';

const localDev = false;
export const API_BASE = localDev ? 'http://en.se:3000' : 'https://api.ense.nyc';
export const CLIENT_ID = 'PfE36O4PtvqmtPZf9VCXaf3D00GBGVGwn8VsPVqBLUy88POt';
export const AWS_ACCESS_KEY_ID = 'AKIAJGPMBNUIOKY2WMHA';

export const urlFor = (path: string): string => `${API_BASE}${path}`;

type Fetch<T> = (
  path: string,
  params: ?Object,
  extraOptions?: Object,
  extraHeaders?: Object,
  rawOpts?: Object
) => Promise<T>;

/**
 * Ense `fetch` wrapper. All http methods have a corresponding wrapped
 * version that uses this as a base, e.g. {@link $get}, and so all have
 * the same interface.
 * @param path - ense api path
 * @param params - [optional] params for the http method
 * @param extraOptions - [optional] options for the underlying fetch operation
 * @param extraHeaders - [optional] extra headers to attach to the request
 * @param rawOpts - [optional] raw fetch opts, takes precedence if supplied
 * @returns {Promise<T>} JSON or text deserialized response iff response code in [200,300).
 */
export const $fetch: Fetch<*> = (path, params, extraOptions, extraHeaders, rawOpts) => {
  const opts = rawOpts || { ...extraOptions, headers: { ...extraHeaders, ...getAuth() } };
  return fetch(urlFor(path), opts)
    .then(log(path, opts, new Date().getTime())) // TODO move this out
    .then(checkStatus)
    .then(deserialize);
};

// HTTP Methods

export const $get: Fetch<*> = (path, params, extraOptions, extraHeaders) =>
  $fetch(path + (params ? `?${qs(params)}` : ''), null, null, null, {
    ...extraOptions,
    method: 'GET',
    headers: { ...extraHeaders, ...getAuth() },
  });

export const $post: Fetch<*> = (path, params, extraOptions, extraHeaders) =>
  $fetch(path, null, null, null, {
    ...extraOptions,
    method: 'POST',
    headers: { ...extraHeaders, ...getAuth() },
    ...(params && { body: formData(params) }),
  });

// Private

const qs = (params: Object): string =>
  Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

const formData = (params: Object): FD => {
  const fd = new FD();
  Object.keys(params).forEach(key => fd.append(key, params[key]));
  return fd;
};

const deserialize = (r: Response): any =>
  (r.headers.get('content-type') || '').includes('json') ? r.json() : r.text();

const log = (path, opts, startMili) => (r: Response): any => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${path} - ${r.status} (${new Date().getTime() - startMili}ms)`);
    console.log('req', path, opts);
    console.log('res', path, r);
  }
  return r;
};

const getAuth = (): ?{ Authorization: string } => {
  const deviceSecretKey = get(store.getState(), 'auth.deviceSecretKey');
  const Authorization = `bearer ${deviceSecretKey}`;
  return deviceSecretKey && { Authorization };
};

const checkStatus = (response: Response): Response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    // $FlowIgnore - allow attaching response object
    error.response = response;
    throw error;
  }
};

export { routes };
