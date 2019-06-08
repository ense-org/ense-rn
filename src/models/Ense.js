// @flow
import { get } from 'lodash';
import { type EnseJSON } from 'models/types';

export default class Ense {
  +url: string;
  +subtitle: string;
  +metadata: ?Object;
  +title: string;
  +altList: ?string;
  +order: number;

  +_raw: EnseJSON;

  constructor(json: EnseJSON) {
    this.url = get(json, 'url');
    this.subtitle = get(json, 'subtitle');
    this.metadata = get(json, 'metadata');
    this.title = get(json, 'title');
    this.altList = get(json, 'altList');
    this.order = get(json, 'order');
    this._raw = json;
  }

  toJSON(): EnseJSON {
    return (
      this._raw || {
        url: this.url,
        subtitle: this.subtitle,
        metadata: this.metadata,
        altList: this.altList,
        order: this.order,
      }
    );
  }

  static parse(json: EnseJSON): Ense {
    return new Ense(json);
  }
}
