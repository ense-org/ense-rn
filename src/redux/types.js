// @flow
import type { FeedState } from 'redux/ducks/feed';

export type State = {
  auth: { deviceSecretKey: ?string },
  feed: FeedState,
};

export type PayloadAction<P: any, T: string = string> = {
  type: T,
  payload: P,
};
