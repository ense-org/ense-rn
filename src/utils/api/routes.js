// @flow

import { genColorCode } from 'utils/strings';

export default {
  registerDevice: '/device/register',
  smsVerifyRequest: '/verify/SMS',
  smsVerifyConfirm: '/verify/SMS/confirm',
  emailVerify: '/verify',

  userHandle: '/accounts/handle',

  explore: '/explore',

  accountInfo: '/accounts/info',
  publicAccountFor: (handle: string) => `/accounts/handle/${handle}`,

  followersFor: (handle: string) => `/accounts/followers/${handle}`,
  followingFor: (handle: string) => `/accounts/following/${handle}`,

  latestUsers: '/accounts/utils/latest',
  trendingTopics: '/topics/utils/lists/popular',

  myEnses: '/accounts/myEnses',
  channelFor: (username: string) => `/channel/${username}`,
  playlistNamed: (name: string) => `/playlist/enses/${name}`,

  topic: (tag: string) => `/topics/${tag}`,

  newEnse: (code: string = genColorCode()) => `/ense/${code}`,
  publishEnse: (color: string, dbKey: string) => `/ense/${color}/${dbKey}`,

  listenersOf: (handle: string, key: string) => `/ense/listeners/${handle}/${key}`,
  reactionsFor: (handle: string, key: string) => `/ense/reaction/${handle}/${key}`,
  convoFor: (handle: string, key: string) => `/ense/convo/${handle}/${key}`,

  mentionsMe: '/attags/me',
  mentionsHandle: (handle: string) => `/attags/public/handle/${handle}`,
  inbox: '/notifications/inbox',

  betweenYou: (andWho: string) => `/conversation/${andWho}`,

  searchUsers: (query: string) => `/accounts/utils/search/%25${query}%25`,
  searchTopics: (query: string) => `/topics/utils/search/%25${query}%25`,
  searchEnses: (query: string) => `/search/title/%25${query}%25`,

  upload: '/upload',
  uploadDone: (id: string) => `/upload/done/${id}`,
};
