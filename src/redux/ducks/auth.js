// @flow

import { createAction, createReducer, createSelector } from 'redux-starter-kit';
import { type State } from 'redux/types';

export const saveDeviceKey = createAction('auth/saveDeviceKey');

export type AuthState = {
  deviceSecretKey: ?string,
  user: ?Object,
};

const defaultState: AuthState = { deviceSecretKey: null, user: null };

export const reducer = createReducer(defaultState, {
  [saveDeviceKey]: (state, action) => ({ deviceSecretKey: action.payload }),
});

export const keySelector = createSelector(
  ['auth.deviceSecretKey'],
  t => t
);

export const deviceSecretKey = (s: State) => ({
  deviceSecretKey: keySelector(s),
});
