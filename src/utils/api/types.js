// @flow
import type { EnseId, EnseJSON, FeedPath } from 'models/types';

export type HasRemoteCount = { remoteTotal: ?number };

export type FeedResponse = HasRemoteCount & {
  enses: [EnseId, EnseJSON],
};

export type { EnseJSON, FeedJSON, EnseId, FeedPath } from 'models/types';
