// @flow
import type { FeedJSON, EnseJSON } from 'models/types';
import type { FeedResponse } from 'utils/api/types';

export type State = {
  auth: {
    deviceSecretKey: ?string,
  },
  feed: {
    feedLists: FeedJSON[],
    enses: { [string]: FeedResponse },
  },
};
