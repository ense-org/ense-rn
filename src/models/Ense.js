// @flow
import { get } from 'lodash';
import { ZonedDateTime } from 'js-joda';
import type { EnseJSON, EnseId } from 'models/types';

export default class Ense {
  +audioVersion: number;
  +author: string; // ""
  +createDate: ZonedDateTime; // "2019-06-06T02:24:59.880Z"
  +device: number; // 79993
  +duration: number; // 19807
  +editLocked: boolean; // false
  +fileUrl: string; // "https://s3.amazonaws.com/media..."
  +handle: string; // "indigogreenred"
  +hasReleaseDate: boolean; // true
  +humanInterpretation: string; // ""
  +isExclusive: boolean; // false
  +key: EnseId; // "238264"
  +lastUpdated: ZonedDateTime; // "2019-06-06T02:25:01.482Z"
  +likeCount: number; // 0
  +likeTypes: string; // ""
  +playcount: number; // 6
  +profpic: string; // "https://s3.amazonaws.com/media..."
  +reEnse: boolean; // false
  +repliesCount: number; // 0
  +replyHandle: ?string; // null
  +replyKey: ?string; // null
  +replyRootHandle: ?string; // null
  +replyRootKey: ?string; // null
  +replyRootTitle: ?string; // null
  +replyTitle: ?string; // null
  +seriesComment: ?string; // null
  +seriesTrackNum: ?number; // null
  +timestamp: ZonedDateTime; // "2019-06-06T02:24:59.880Z"
  +title: string; // "NBA update finals game 3"
  +topicList: string; // ""
  +unlisted: boolean; // false
  +userAgent: string; // "ios"
  +userFavorited: ?boolean; // null
  +userListened: ?boolean; // null
  +userReported: ?boolean; // null
  +userhandle: ?string; // "iqram"
  +username: ?string; // "iqram"

  +_raw: EnseJSON;

  constructor(json: EnseJSON) {
    this._raw = json;
    this.audioVersion = get(json, 'audioVersion');
    this.author = get(json, 'author');
    this.createDate = ZonedDateTime.parse(get(json, 'createDate'));
    this.device = get(json, 'device');
    this.duration = get(json, 'duration');
    this.editLocked = get(json, 'editLocked');
    this.fileUrl = get(json, 'fileUrl');
    this.handle = get(json, 'handle');
    this.hasReleaseDate = get(json, 'hasReleaseDate');
    this.humanInterpretation = get(json, 'humanInterpretation');
    this.isExclusive = get(json, 'isExclusive');
    this.key = get(json, 'key');
    this.lastUpdated = ZonedDateTime.parse(get(json, 'lastUpdated'));
    this.likeCount = get(json, 'likeCount');
    this.likeTypes = get(json, 'likeTypes');
    this.playcount = get(json, 'playcount');
    this.profpic = get(json, 'profpic');
    this.reEnse = get(json, 'reEnse');
    this.repliesCount = get(json, 'repliesCount');
    this.replyHandle = get(json, 'replyHandle');
    this.replyKey = get(json, 'replyKey');
    this.replyRootHandle = get(json, 'replyRootHandle');
    this.replyRootKey = get(json, 'replyRootKey');
    this.replyRootTitle = get(json, 'replyRootTitle');
    this.replyTitle = get(json, 'replyTitle');
    this.seriesComment = get(json, 'seriesComment');
    this.seriesTrackNum = get(json, 'seriesTrackNum');
    this.timestamp = ZonedDateTime.parse(get(json, 'timestamp'));
    this.title = get(json, 'title');
    this.topicList = get(json, 'topicList');
    this.unlisted = get(json, 'unlisted');
    this.userAgent = get(json, 'userAgent');
    this.userFavorited = get(json, 'userFavorited');
    this.userListened = get(json, 'userListened');
    this.userReported = get(json, 'userReported');
    this.userhandle = get(json, 'userhandle');
    this.username = get(json, 'username');
  }

  toJSON(): EnseJSON {
    return this._raw;
  }

  static parse(json: EnseJSON): Ense {
    return new Ense(json);
  }
}
