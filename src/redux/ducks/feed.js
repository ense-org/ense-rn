// @flow

import { createAction, createReducer, createSelector } from 'redux-starter-kit';
import { mapValues } from 'lodash';
import { type State } from 'redux/types';
import type Feed from 'models/Feed';
import Ense from 'models/Ense';

export const saveFeedsList = createAction('feed/saveFeedsLists');
export const saveEnses = createAction('feed/saveEnses');

export const reducer = createReducer(
  { feedLists: [], enses: {} },
  {
    [saveFeedsList]: (s, a) => ({ ...s, feedLists: a.payload }),
    [saveEnses]: (s, a) => ({ ...s, enses: a.payload }),
  }
);

export const feedLists = createSelector(
  ['feed.feedLists'],
  t => t
);

export const enses = createSelector(
  ['feed.enses'],
  t => t
);

export type SelectedFeedLists = { feedLists: Feed[] };
export const selectFeedLists = (s: State): SelectedFeedLists => ({
  feedLists: feedLists(s),
});

export type SelectedEnses = { enses: { [string]: Ense[] } };
export const selectEnses = (s: State): SelectedEnses => ({
  enses: mapValues(enses(s), v => v.enses.map(Ense.parse)),
});
