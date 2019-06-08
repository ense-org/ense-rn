// @flow

import { ZonedDateTime } from 'js-joda';

export type EnseId = string;
export type EnseJSON = {
  +audioVersion: number,
  +author: string,
  +createDate: ZonedDateTime,
  +device: number,
  +duration: number,
  +editLocked: boolean,
  +fileUrl: string,
  +handle: string,
  +hasReleaseDate: boolean,
  +humanInterpretation: string,
  +isExclusive: boolean,
  +key: EnseId,
  +lastUpdated: ZonedDateTime,
  +likeCount: number,
  +likeTypes: string,
  +playcount: number,
  +profpic: string,
  +reEnse: boolean,
  +repliesCount: number,
  +replyHandle: ?string,
  +replyKey: ?string,
  +replyRootHandle: ?string,
  +replyRootKey: ?string,
  +replyRootTitle: ?string,
  +replyTitle: ?string,
  +seriesComment: ?string,
  +seriesTrackNum: ?number,
  +timestamp: ZonedDateTime,
  +title: string,
  +topicList: string,
  +unlisted: boolean,
  +userAgent: string,
  +userFavorited: ?boolean,
  +userListened: ?boolean,
  +userReported: ?boolean,
  +userhandle: ?string,
  +username: ?string,
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
