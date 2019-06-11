// @flow

import { ZonedDateTime } from 'js-joda';

export type EnseId = string;
export type EnseJSON = {
  +audioVersion: number,
  +author: string, // ""
  +createDate: string, // "2019-06-06T02:24:59.880Z"
  +device: number, // 79993
  +duration: number, // 19807
  +editLocked: boolean, // false
  +fileUrl: string, // "https://s3.amazonaws.com/media..."
  +handle: string, // "indigogreenred"
  +hasReleaseDate: boolean, // true
  +humanInterpretation: string, // ""
  +isExclusive: boolean, // false
  +key: EnseId, // "238264"
  +lastUpdated: string, // "2019-06-06T02:25:01.482Z"
  +likeCount: number, // 0
  +likeTypes: string, // ""
  +playcount: number, // 6
  +profpic: string, // "https://s3.amazonaws.com/media..."
  +reEnse: boolean, // false
  +repliesCount: number, // 0
  +replyHandle: ?string, // null
  +replyKey: ?string, // null
  +replyRootHandle: ?string, // null
  +replyRootKey: ?string, // null
  +replyRootTitle: ?string, // null
  +replyTitle: ?string, // null
  +seriesComment: ?string, // null
  +seriesTrackNum: ?number, // null
  +timestamp: string, // "2019-06-06T02:24:59.880Z"
  +title: string, // "NBA update finals game 3"
  +topicList: string, // ""
  +unlisted: boolean, // false
  +userAgent: string, // "ios"
  +userFavorited: ?boolean, // null
  +userListened: ?boolean, // null
  +userReported: ?boolean, // null
  +userhandle: ?string, // "iqram"
  +username: ?string, // "iqram"
};

// This is basically used as a feed ID
export type FeedPath = string;
export type FeedJSON = {
  +url: FeedPath,
  +subtitle: string,
  +metadata: ?Object,
  +title: string,
  +altList: ?string,
  +order: number,
};

export type UserId = number;
export type UserJSON = {
  +adminLevel: number, // 0,
  +bio: ?string, // null,
  +displayName: ?string, // "rc",
  +email: ?string, // "kousun12@gmail.com",
  +exclusiveCreatorUntil: ?string, // null,
  +exclusiveListenerUntil: ?string, // "2020-05-25T22:53:31.968Z",
  +favorites: ?string, // "1188/legacy",
  +followers: number, // 10,
  +handle: ?string, // "rc",
  +id: UserId, // 362,
  +notifications: ?number, // 5,
  +externalAccounts: [string, string][], // [["foo", "12334"]]
  +profpicURL: ?string, // "https://s3.amazonaws.com/...",
};
