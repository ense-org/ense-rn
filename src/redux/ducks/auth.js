// @flow

import { createAction, createReducer, createSelector } from 'redux-starter-kit';
import { type State } from 'redux/types';

export const save = createAction('auth/save');

export const reducer = createReducer(
  { deviceSecretKey: null },
  {
    [save]: (state, action) => ({ deviceSecretKey: action.payload }),
  }
);

export const keySelector = createSelector(
  ['auth.deviceSecretKey'],
  t => t
);

export const deviceSecretKey = (s: State) => ({
  deviceSecretKey: keySelector(s),
});
