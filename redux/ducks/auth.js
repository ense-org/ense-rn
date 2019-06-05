// @flow

import { createAction, createReducer } from 'redux-starter-kit';

const save = createAction('auth/save');

export const reducer = createReducer(
  { token: null },
  {
    [save.type]: (state, action) => ({ token: action.payload }),
  }
);
