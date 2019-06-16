// @flow
import { get } from 'lodash';
import { ZonedDateTime } from 'js-joda';
import { type UserJSON, type UserId } from 'models/types';
import type { BasicUserInfo } from 'models/types';

export default class User {
  +id: UserId;
  +adminLevel: number;
  +bio: ?string;
  +displayName: ?string;
  +email: ?string;
  +exclusiveCreatorUntil: ?ZonedDateTime;
  +exclusiveListenerUntil: ?ZonedDateTime;
  +externalAccounts: [string, string][];
  +favorites: ?string;
  +followers: number;
  +handle: ?string;
  +notifications: ?number;
  +profpicURL: ?string;

  +_raw: UserJSON;

  constructor(json: UserJSON) {
    this.id = get(json, 'id');
    this.adminLevel = get(json, 'adminLevel');
    this.bio = get(json, 'bio');
    this.displayName = get(json, 'displayName');
    this.email = get(json, 'email');
    const excCreateUntil = get(json, 'exclusiveCreatorUntil');
    this.exclusiveCreatorUntil = excCreateUntil && ZonedDateTime.parse(excCreateUntil);
    const excLUntil = get(json, 'exclusiveListenerUntil');
    this.exclusiveListenerUntil = excLUntil && ZonedDateTime.parse(excLUntil);
    this.externalAccounts = get(json, 'externalAccounts');
    this.favorites = get(json, 'favorites');
    this.followers = get(json, 'followers');
    this.handle = get(json, 'handle');
    this.notifications = get(json, 'notifications');
    this.profpicURL = get(json, 'profpicURL');

    this._raw = json;
  }

  toJSON(): UserJSON {
    return this._raw;
  }

  basicInfo(): BasicUserInfo {
    return {
      bio: this.bio,
      handle: this.handle,
      username: this.displayName,
      imgUrl: this.profpicURL,
      userId: String(this.id),
      followerCount: this.followers,
    };
  }

  static parse(json: UserJSON): User {
    return new User(json);
  }
}

export type { UserJSON } from './types';
