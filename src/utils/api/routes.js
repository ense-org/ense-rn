// @flow

import { genColorCode } from 'utils/strings';

export default {
  registerDevice: '/device/register',
  smsVerifyRequest: '/verify/SMS',
  smsVerifyConfirm: '/verify/SMS/confirm',

  explore: '/explore',

  accountInfo: '/accounts/info',
  publicAccountFor: (handle: string) => `/accounts/handle/${handle}`,

  followersFor: (handle: string) => `/accounts/followers/${handle}`,
  followingFor: (handle: string) => `/accounts/following/${handle}`,

  latestUsers: '/accounts/utils/latest',
  trendingTopics: '/topics/utils/lists/popular',

  myEnses: '/accounts/myEnses',
  channelFor: (username: string) => `/channel/${username}`,

  topic: (tag: string) => `/topics/${tag}`,

  newEnse: (code: string = genColorCode()) => `/ense/${code}`,
  publishEnse: (color: string, dbKey: string) => `/ense/${color}/${dbKey}`,

  listenersOf: (handle: string, key: string) => `/ense/listeners/${handle}/${key}`,
  reactionsFor: (handle: string, key: string) => `/ense/reaction/${handle}/${key}`,
};
