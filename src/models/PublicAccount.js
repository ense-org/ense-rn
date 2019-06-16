// @flow
import { get } from 'lodash';
import { type PublicAccountJSON, type PublicAccountId } from 'models/types';
import type { BasicUserInfo } from 'models/types';

export default class PublicAccount {
  +publicAccountExtraInfo: ?string;
  +publicAccountBio: ?string;
  +publicAccountHandle: ?string;
  +publicAccountExtraInfoContext: ?string;
  +publicProfileImageUrl: ?string;
  +publicAccountInfoSubscribers: number;
  +publicAccountDisplayName: ?string;
  +publicAccountId: PublicAccountId;

  +_raw: PublicAccountJSON;

  constructor(json: PublicAccountJSON) {
    this.publicAccountExtraInfo = get(json, 'publicAccountExtraInfo');
    this.publicAccountBio = get(json, 'publicAccountBio');
    this.publicAccountHandle = get(json, 'publicAccountHandle');
    this.publicAccountExtraInfoContext = get(json, 'publicAccountExtraInfoContext');
    this.publicProfileImageUrl = get(json, 'publicProfileImageUrl');
    this.publicAccountInfoSubscribers = get(json, 'publicAccountInfoSubscribers');
    this.publicAccountDisplayName = get(json, 'publicAccountDisplayName');
    this.publicAccountId = get(json, 'publicAccountId');

    this._raw = json;
  }

  toJSON(): PublicAccountJSON {
    return this._raw;
  }

  basicInfo(): BasicUserInfo {
    return {
      bio: this.publicAccountBio,
      handle: this.publicAccountHandle,
      username: this.publicAccountDisplayName,
      imgUrl: this.publicProfileImageUrl,
      userId: this.publicAccountId,
    };
  }

  static parse(json: PublicAccountJSON): PublicAccount {
    return new PublicAccount(json);
  }
}

export type { PublicAccountJSON } from './types';
