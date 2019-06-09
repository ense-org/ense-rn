// @flow
import type { FeedState } from 'redux/ducks/feed';
import type { AuthState } from 'redux/ducks/auth';

export type State = {
  auth: AuthState,
  feed: FeedState,
};

export type PayloadAction<P: any, T: string = string> = {
  type: T,
  payload: P,
};
