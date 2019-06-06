// @flow

import { createAction, createReducer, createSelector } from 'redux-starter-kit';

const save = createAction('auth/save');

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

export const deviceSecretKey = s => ({
  deviceSecretKey: keySelector(s),
});