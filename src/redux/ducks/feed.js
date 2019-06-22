// @flow
/* eslint-disable no-param-reassign */
// ^ NB: immer for store updates

import { createAction, createReducer, createSelector } from 'redux-starter-kit';
import Constants from 'expo-constants';
import { forIn, sortedUniq, flatten, pick, mapValues, fromPairs, omitBy, sortBy } from 'lodash';
import type { State, PayloadAction } from 'redux/types';
import Feed from 'models/Feed';
import type {
  FeedResponse,
  HasRemoteCount,
  EnseJSON,
  FeedJSON,
  EnseId,
  FeedPath,
} from 'utils/api/types';
import type { HasLastUpdated } from 'utils/types';
import { Instant } from 'js-joda';
import Ense from 'models/Ense';

export type EnseGroups = { [FeedPath]: FeedResponse };
export type EnseIdFeedGroups = {| feeds: { [FeedPath]: EnseId[] } |};
export type HomeSection = { data: EnseId[], feed: Feed };
export type HomeInfo = HasLastUpdated & { enses: { [EnseId]: Ense }, sections: HomeSection[] };
export type SelectedFeedLists = {| feedLists: { [FeedPath]: Feed } |};
export type EnseCache = { [EnseId]: EnseJSON };
export type FeedState = {
  feedLists: FeedJSON[],
  enses: { _cache: EnseCache },
  home: { ...HasRemoteCount, ...HasLastUpdated, ...EnseIdFeedGroups },
};

/**
 * Rough guess on good sizes for cache, given avg device specs.
 * see https://github.com/facebook/device-year-class for info
 * NB: You are not guaranteed a cache < this size, this is just
 * the threshold that invokes the prune strategy.
 */
const CACHE_CUT_SIZE: number = (() => {
  const { deviceYearClass } = Constants;
  if (!deviceYearClass) {
    return 600;
  }
  return deviceYearClass < 2013 ? 400 : 1200;
})();

export const saveFeedsList = createAction('feed/saveFeedsLists');
export const replaceEnses = createAction('feed/saveEnses');
export const updateEnses = createAction('feed/updateEnses');

export const feedLists = createSelector(
  ['feed.feedLists'],
  t => fromPairs(t.map(l => [l.url, Feed.parse(l)]))
);

export const homeFeeds = createSelector(
  ['feed.home.feeds'],
  t => t
);

export const homeUpdated = createSelector(
  ['feed.home._lastUpdated'],
  t => t
);

export const homeEnses = createSelector(
  [homeFeeds, 'feed.enses._cache'],
  (feeds, fullCache) => pick(fullCache, sortedUniq(flatten(Object.values(feeds))))
);

export const home = createSelector(
  [homeFeeds, homeEnses, homeUpdated, feedLists],
  (feeds, enses, _lastUpdated, lists) => {
    const sections = Object.entries(omitBy(feeds, v => v.length === 0)).map(([k, v]) => ({
      data: v,
      feed: lists[k],
    }));
    return {
      sections: sortBy(sections, 'feed.order'),
      enses: mapValues(enses, Ense.parse),
      _lastUpdated,
    };
  }
);

export const selectFeedLists = (s: State): SelectedFeedLists => ({
  feedLists: feedLists(s),
});

export const selectHome = (s: State) => ({
  home: home(s),
});

/**
 * (Basic) strategy for cleaning out the cache when it's too big
 * @private
 */
const _manageCache = (cache: EnseCache) => {
  const vals = Object.keys(cache);
  if (vals.length < CACHE_CUT_SIZE) {
    return;
  }
  const sorted = sortedUniq(vals);
  for (let i = 0; i < CACHE_CUT_SIZE / 2; i++) {
    delete cache[sorted[i]];
  }
};

/**
 * Save the ense cache state, given a new list of feeds and enses within those feeds.
 * Note this uses immer as a part of redux-starter-kit to 'mutate' state in place.
 * @private
 */
const _saveEnsesCache = (s: FeedState, a: PayloadAction<EnseGroups>): void => {
  _manageCache(s.enses._cache);
  Object.keys(s.home.feeds).forEach(k => delete s.home.feeds[k]);
  s.home._lastUpdated = Instant.now().epochSecond();
  forIn(a.payload, (v, k) => {
    s.home.feeds[k] = [];
    v.enses.forEach(([id, json]) => {
      s.enses._cache[id] = json;
      s.home.feeds[k].push(id);
    });
  });
};

/**
 * Same as above, but does not blow away everything. Use this to target keys in the
 * home feed cache to update
 * @private
 */
const _saveFeedIncremental = (s: FeedState, a: PayloadAction<EnseGroups>): void => {
  _manageCache(s.enses._cache);
  Object.keys(a.payload).forEach(k => delete s.home.feeds[k]);
  s.home._lastUpdated = Instant.now().epochSecond();
  forIn(a.payload, (v, k) => {
    s.home.feeds[k] = [];
    v.enses.forEach(([id, json]) => {
      s.enses._cache[id] = json;
      s.home.feeds[k].push(id);
    });
  });
};

const defaultState: FeedState = {
  feedLists: [],
  enses: { _cache: {} },
  home: { _lastUpdated: null, feeds: {}, remoteTotal: null },
};

export const reducer = createReducer(defaultState, {
  [saveFeedsList]: (s, a) => ({ ...s, feedLists: a.payload }),
  [replaceEnses]: _saveEnsesCache,
  [updateEnses]: _saveFeedIncremental,
});
