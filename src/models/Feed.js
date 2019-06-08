// @flow
import { get } from 'lodash';
import { $get } from 'utils/api';
import { type FeedJSON } from 'models/types';

export default class Feed {
  +url: string;
  +subtitle: string;
  +metadata: ?Object;
  +title: string;
  +altList: ?string;
  +order: number;

  +_raw: FeedJSON;

  constructor(json: FeedJSON) {
    this.url = get(json, 'url');
    this.subtitle = get(json, 'subtitle');
    this.metadata = get(json, 'metadata');
    this.title = get(json, 'title');
    this.altList = get(json, 'altList');
    this.order = get(json, 'order');
    this._raw = json;
  }

  toJSON(): FeedJSON {
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

  fetch(params?: Object): Promise<Object[]> {
    return $get(this.url, params);
  }

  static parse(json: FeedJSON): Feed {
    return new Feed(json);
  }
}

export type { FeedJSON } from './types';
