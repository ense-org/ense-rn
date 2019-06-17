// @flow
import type { FeedState } from 'redux/ducks/feed';
import type { AuthState } from 'redux/ducks/auth';
import type { RunState } from 'redux/ducks/run';
import type { AudioState } from 'redux/ducks/audio';
import type { AccountsState } from 'redux/ducks/accounts';
import type { AccountId, PublicAccountJSON } from 'models/types';

export type State = {
  auth: AuthState,
  feed: FeedState,
  run: RunState,
  audio: AudioState,
  accounts: AccountsState,
};

export type GetState = () => State;
export type PayloadAction<P: any> = { type: string, payload: P };
type Action = PayloadAction<any>;

export type Dispatch = (action: Action | ThunkAction | PromiseAction | Array<Action>) => any;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
export type PromiseAction = Promise<Action>;

export type AccountsCache = { [AccountId]: PublicAccountJSON };
