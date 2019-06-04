// @flow
import { createAction, createReducer } from 'redux-starter-kit';

const save = createAction('auth/save');

export const reducer = createReducer(null, {
  [save]: (state, action) => action.payload,
});
