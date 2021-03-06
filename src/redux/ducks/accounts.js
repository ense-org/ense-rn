// @flow
/* eslint-disable no-param-reassign */
// ^ NB: immer for store updates
import { get, uniq } from 'lodash';
import { createAction, createReducer, createSelector } from 'redux-starter-kit';
import Constants from 'expo-constants';
import type { AccountsCache, PayloadAction, State, Dispatch, GetState } from 'redux/types';
import type { AccountHandle, AccountPayload, AccountId, PublicAccountJSON } from 'utils/api/types';
import { userSelector } from 'redux/ducks/auth';
import User from 'models/User';
import PublicAccount from 'models/PublicAccount';
import type { BasicUserInfo } from 'models/types';
import { asArray } from 'utils/other';
import type { ArrayOrSingle } from 'utils/other';
import Ense from 'models/Ense';
import { $get, $post, routes } from 'utils/api';

type IdMemo = { [AccountId]: AccountId[] };
type HandleMap = { [string]: AccountId };

export type AccountsState = {
  _cache: AccountsCache,
  /**
   * exists only because Ense json doesn't come with userId
   */
  _handleMap: HandleMap,
  _followerCache: IdMemo,
  _followingCache: IdMemo,
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
export const cacheProfiles = createAction('accounts/cacheProfiles');
const _rawSetFollow = createAction('accounts/rawFollows');

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
type FollowPayload = [AccountId, AccountPayload[]];
/**
 * Save the ense cache state, given a new list of feeds and enses within those feeds.
 * Note this uses immer as a part of redux-starter-kit to 'mutate' state in place.
 * @private
 */
const _saveCache = (s: AccountsState, accounts: $ReadOnlyArray<PublicAccountJSON>): void => {
  _manageCache(s._cache);
  accounts.forEach(pa => {
    const [id, h] = [pa.publicAccountId, pa.publicAccountHandle];
    id && (s._cache[id] = pa);
    id && h && (s._handleMap[h] = id);
  });
};

const _saveFollowing = (s: AccountsState, a: PayloadAction<FollowPayload>): void => {
  const [id, list] = a.payload;
  const accounts = list.map(p => p[1]);
  _saveCache(s, accounts);
  if (id) {
    s._followingCache[id] = accounts.map(i => i.publicAccountId);
  }
};

const _saveFollowers = (s: AccountsState, a: PayloadAction<FollowPayload>): void => {
  const [id, list] = a.payload;
  const accounts = list.map(p => p[1]);
  _saveCache(s, accounts);
  if (id) {
    s._followerCache[id] = accounts.map(i => i.publicAccountId);
  }
};

const _cacheProfiles = (
  s: AccountsState,
  a: PayloadAction<ArrayOrSingle<PublicAccountJSON>>
): void => {
  _saveCache(s, asArray(a.payload));
};

const _rawFollows = (
  s: AccountsState,
  a: PayloadAction<{ id: AccountId, followers?: AccountId[], following?: AccountId[] }>
): void => {
  const { id, followers, following } = a.payload;
  if (id && followers) {
    s._followerCache[id] = followers;
  }
  if (id && following) {
    s._followingCache[id] = following;
  }
};

export const getOrFetch = (handle: string) => async (d: Dispatch, gs: GetState): void => {
  const s = gs().accounts;
  const id = s._handleMap[handle];
  const found = id && s._cache[id];
  const profile = found || (await $get(routes.publicAccountFor(handle)));
  d(cacheProfiles(profile));
  return PublicAccount.parse(profile);
};

export const setSubscribed = (handle: AccountHandle, id: AccountId, subscribed: boolean) => async (
  d: Dispatch,
  gs: GetState
): void => {
  let me = get(gs(), 'auth.user');
  if (!me || !handle) {
    return;
  }
  me = User.parse(me);
  const myId = String(me.id);
  const following = gs().accounts._followingCache[myId];

  const update = subscribed ? following.concat(id) : following.filter(a => a !== id);
  d(_rawSetFollow({ id: me.id, following: uniq(update) }));
  try {
    const key = subscribed ? 'usersToFollow' : 'usersToUnfollow';
    await $post(routes.subscriptions, { [key]: handle });
  } catch {
    d(_rawSetFollow({ id: me.id, following }));
  }
};

const defaultState: AccountsState = {
  _cache: {},
  _handleMap: {},
  _followingCache: {},
  _followerCache: {},
};

export const followersFor = createSelector(
  ['accounts._followerCache'],
  t => t
);

export const followingFor = createSelector(
  ['accounts._followingCache'],
  t => t
);

const getUserId = (s: State, props: { userId: ?AccountId }) => props.userId;
const getUserHandle = (s: State, props: { userHandle: AccountHandle }) => props.userHandle;
export const getReplyKey = (_: any, props: { ense: Ense }) => props.ense.replyKey;

export type UserInfo = {|
  ...BasicUserInfo,
  followers: AccountId[],
  following: AccountId[],
|};

const emptyInfo: BasicUserInfo = {
  bio: null,
  handle: null,
  username: null,
  imgUrl: null,
  userId: null,
};

/**
 * A pretty involved selector, partially because we want the caches to be userId indexed
 * and enses only come with handles.
 *
 * see {@link ProfileScreen}.
 */
export const makeUserInfoSelector = () =>
  createSelector(
    [
      getUserId,
      getUserHandle,
      userSelector,
      'accounts._cache',
      'accounts._handleMap',
      followingFor,
      followersFor,
    ],
    (
      id: ?AccountId,
      handle: AccountHandle,
      u: ?User,
      a: AccountsCache,
      handleMap: HandleMap,
      flng: IdMemo,
      flrs: IdMemo
    ): UserInfo => {
      // We can get rid of handleMap after enses come back with userKey
      const bestId = id || get(handleMap, handle);
      if (!bestId) {
        return { following: [], followers: [], ...emptyInfo };
      }
      const fromCache = a[bestId] ? PublicAccount.parse(a[bestId]) : null;
      let info: BasicUserInfo;
      if (u && String(u.id) === bestId) {
        info = u.basicInfo();
      } else if (fromCache) {
        info = fromCache.basicInfo();
      } else {
        info = emptyInfo;
      }
      return { following: get(flng, bestId, []), followers: get(flrs, bestId, []), ...info };
    }
  );

export const myFollowing = createSelector(
  [userSelector, followingFor, followersFor],
  (u: ?User, flng: IdMemo): UserInfo => {
    const id = u && String(u.id);
    return id ? get(flng, id, []) : [];
  }
);

export const reducer = createReducer(defaultState, {
  [saveFollowing]: _saveFollowing,
  [saveFollowers]: _saveFollowers,
  [cacheProfiles]: _cacheProfiles,
  [_rawSetFollow]: _rawFollows,
});
