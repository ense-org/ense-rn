// @flow
import { get } from 'lodash';
import { ZonedDateTime, ZoneId, Duration } from 'js-joda';
import type { EnseJSON, EnseId } from 'models/types';
import { fmtDateShort, fmtMonthDay, sysTz, toDeviceTime, toDurationStr } from 'utils/time';

export default class Ense {
  +audioVersion: number;
  +author: string;
  +createDate: ZonedDateTime;
  +device: number;
  +duration: number;
  +editLocked: boolean;
  +fileUrl: string;
  +handle: string;
  +hasReleaseDate: boolean;
  +humanInterpretation: string;
  +isExclusive: boolean;
  +key: EnseId;
  +lastUpdated: ZonedDateTime;
  +likeCount: number;
  +likeTypes: string;
  +playcount: number;
  +profpic: string;
  +reEnse: boolean;
  +repliesCount: number;
  +replyHandle: ?string;
  +replyKey: ?string;
  +replyRootHandle: ?string;
  +replyRootKey: ?string;
  +replyRootTitle: ?string;
  +replyTitle: ?string;
  +seriesComment: ?string;
  +seriesTrackNum: ?number;
  +timestamp: ZonedDateTime;
  +title: string;
  +topicList: string;
  +unlisted: boolean;
  +userAgent: string;
  +userFavorited: ?boolean;
  +userListened: ?boolean;
  +userReported: ?boolean;
  +userhandle: ?string;
  +username: ?string;
  +userKey: ?number;

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
    this.userKey = get(json, 'userKey');
  }

  agoString(): string {
    const now = ZonedDateTime.now(sysTz);
    const create = toDeviceTime(this.createDate);
    const diff = Duration.between(create, now);
    const dayDiff = diff.toDays();
    if (dayDiff > 4 * 7) {
      const fmt = now.year() === create.year() ? fmtMonthDay : fmtDateShort;
      return create.format(fmt);
    } else if (dayDiff > 7) {
      return `${dayDiff % 7}w ago`;
    } else if (diff.toHours() > 24 || now.dayOfMonth() !== create.dayOfMonth()) {
      const d = Math.max(1, diff.toDays());
      return `${d}d ago`;
    } else if (diff.toHours() > 0) {
      return `${diff.toHours()}h ago`;
    } else if (diff.toMinutes() > 2) {
      return `${diff.toMinutes()}m ago`;
    }
    return 'just now';
  }

  durationString(): string {
    return toDurationStr(this.duration / 1000);
  }

  toJSON(): EnseJSON {
    return this._raw;
  }

  static parse(json: EnseJSON): Ense {
    return new Ense(json);
  }
}
