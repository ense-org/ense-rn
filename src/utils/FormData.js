// @flow
type FormDataValue = any;
type FormDataNameValuePair = [string, FormDataValue];

type Headers = { [name: string]: string };
type FormDataPart =
  | {
      string: string,
      headers: Headers,
    }
  | {
      uri: string,
      headers: Headers,
      name?: string,
      type?: string,
    };

/**
 * This is a dumb hack. Header names are to be case-insensitive, but
 * Yesod does not parse content-disposition in the default rn polyfill.
 * fetch does a complicated path of using these parts to create the http request
 * headers so this is the simplest way out.
 */
export default class FD extends FormData {
  _parts: Array<FormDataNameValuePair>;

  getParts(): Array<FormDataPart> {
    return this._parts.map(([name, value]) => {
      const contentDisposition = `form-data; name="${name}"`;
      const headers: Headers = { 'Content-Disposition': contentDisposition };
      if (typeof value === 'object' && value) {
        if (typeof value.name === 'string') {
          headers['Content-Disposition'] += `; filename="${value.name}"`;
        }
        if (typeof value.type === 'string') {
          headers['content-type'] = value.type;
        }
        return { ...value, headers, fieldName: name };
      }
      return { string: String(value), headers, fieldName: name };
    });
  }
}
