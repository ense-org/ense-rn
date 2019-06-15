// @flow

import { genColorCode } from 'utils/strings';

export default {
  registerDevice: '/device/register',
  smsVerifyRequest: '/verify/SMS',
  smsVerifyConfirm: '/verify/SMS/confirm',

  explore: '/explore',

  accountInfo: '/accounts/info',
  myEnses: '/accounts/myEnses',
  followersFor: (handle: string) => `/accounts/followers/${handle}`,
  followingFor: (handle: string) => `/accounts/following/${handle}`,
  channelFor: (username: string) => `/channel/${username}`,

  newEnse: (code: string = genColorCode()) => `/channel/${code}`,
};
