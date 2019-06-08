// @flow
import type { FeedState } from 'redux/ducks/feed';

export type State = {
  auth: { deviceSecretKey: ?string },
  feed: FeedState,
};
