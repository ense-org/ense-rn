// @flow

import { createAction, createReducer, createSelector } from 'redux-starter-kit';
import { type State } from 'redux/types';
import User, { type UserJSON } from 'models/User';

export const saveDeviceKey = createAction('auth/saveDeviceKey');
export const saveUser = createAction('auth/saveUser');
export const setSessioned = createAction('auth/setSessioned');

export type AuthState = {
  deviceSecretKey: ?string,
  sessioned: boolean,
  user: ?UserJSON,
};

export type SelectedUser = { user: ?User };
export type SelectedSessioned = {| sessioned: boolean |};

const defaultState: AuthState = { deviceSecretKey: null, user: null, sessioned: false };

export const reducer = createReducer(defaultState, {
  [saveDeviceKey]: (s, a) => ({ ...s, deviceSecretKey: a.payload }),
  [saveUser]: (s, a) => ({ ...s, user: a.payload }),
  [setSessioned]: s => ({ ...s, sessioned: true }),
});

export const keySelector = createSelector(
  ['auth.deviceSecretKey'],
  t => t
);

export const userSelector = createSelector(
  ['auth.user'],
  t => (t ? User.parse(t) : t)
);

export const sessionedSelector = createSelector(
  ['auth.sessioned'],
  t => t
);

export const selectDeviceKey = (s: State) => ({
  deviceSecretKey: keySelector(s),
});

export const selectUser = (s: State): SelectedUser => ({
  user: userSelector(s),
});

export const selectSessioned = (s: State): SelectedSessioned => ({
  sessioned: sessionedSelector(s),
});
