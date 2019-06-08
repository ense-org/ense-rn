// @flow
import type { EnseJSON } from 'models/types';

export type FeedResponse = {
  enses: EnseJSON,
  remoteTotal: ?number,
};

export type { EnseJSON, FeedJSON } from 'models/types';
