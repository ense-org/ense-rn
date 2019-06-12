// @flow
/* eslint-disable no-param-reassign */
// ^ NB: immer for store updates

import { createAction, createReducer, createSelector } from 'redux-starter-kit';
import Constants from 'expo-constants';
import { forIn, sortedUniq, flatten, pick, mapValues, fromPairs, omitBy } from 'lodash';
import type { State, PayloadAction } from 'redux/types';
import type { PublicAccountJSON, PublicAccountId, AccountPayload } from 'utils/api/types';
import PublicAccount from 'models/PublicAccount';

type AccountsCache = { [PublicAccountId]: PublicAccountJSON };
type FollowMemo = { [PublicAccountId]: PublicAccountId[] };

export type AccountsState = {
  _cache: AccountsCache,
  _followerCache: FollowMemo,
  _followingCache: FollowMemo,
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
    return 8000;
  }
  return deviceYearClass < 2013 ? 4000 : 16000;
})();

export const saveFollowing = createAction('accounts/saveFollowing');
export const saveFollowers = createAction('accounts/saveFollowers');

export const homeUpdated = createSelector(
  ['feed.home._lastUpdated'],
  t => t
);

/**
 * (Basic) strategy for cleaning out the cache when it's too big.
 * @private
 */
const _manageCache = (cache: AccountsCache) => {
  const vals = Object.keys(cache);
  if (vals.length < CACHE_CUT_SIZE) {
    return;
  }
  // just evict a random half
  for (let i = 0; i < CACHE_CUT_SIZE / 2; i++) {
    delete cache[vals[i]];
  }
};

// [user reference, follow[er|ee] list]
type FollowPayload = [PublicAccountId, AccountPayload[]];
/**
 * Save the ense cache state, given a new list of feeds and enses within those feeds.
 * Note this uses immer as a part of redux-starter-kit to 'mutate' state in place.
 * @private
 */
const _saveCache = (s: AccountsState, accounts: AccountPayload[]): void => {
  _manageCache(s._cache);
  accounts.forEach(([d, info, recieveNotifs]) => {
    s._cache[info.publicAccountId] = info;
  });
};

const _saveFollowing = (s: AccountsState, a: PayloadAction<FollowPayload>): void => {
  const [id, list] = a.payload;
  _saveCache(s, list);
  s._followingCache[id] = list.map(([_, i]) => i.publicAccountId);
};

const _saveFollowers = (s: AccountsState, a: PayloadAction<FollowPayload>): void => {
  const [id, list] = a.payload;
  _saveCache(s, list);
  s._followerCache[id] = list.map(([_, i]) => i.publicAccountId);
};

const defaultState: AccountsState = {
  _cache: {},
  _followingCache: {},
  _followerCache: {},
};

export const reducer = createReducer(defaultState, {
  [saveFollowing]: _saveFollowing,
  [saveFollowers]: _saveFollowers,
});
