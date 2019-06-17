// @flow

import { genColorCode } from 'utils/strings';

export default {
  registerDevice: '/device/register',
  smsVerifyRequest: '/verify/SMS',
  smsVerifyConfirm: '/verify/SMS/confirm',

  explore: '/explore',

  accountInfo: '/accounts/info',
  publicAccountFor: (handle: string) => `/handle/${handle}`,

  followersFor: (handle: string) => `/accounts/followers/${handle}`,
  followingFor: (handle: string) => `/accounts/following/${handle}`,

  myEnses: '/accounts/myEnses',
  channelFor: (username: string) => `/channel/${username}`,

  newEnse: (code: string = genColorCode()) => `/ense/${code}`,
  publishEnse: (color: string, dbKey: string) => `/ense/${color}/${dbKey}`,
};
