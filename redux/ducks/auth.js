// @flow

import { createAction, createReducer } from 'redux-starter-kit';

const save = createAction('auth/save');

export const reducer = createReducer(
  { deviceSecretKey: null },
  {
    [save.type]: (state, action) => ({ deviceSecretKey: action.payload }),
  }
);
