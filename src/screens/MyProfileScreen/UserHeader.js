// @flow
import * as React from 'react';
import { get } from 'lodash';
import User from 'models/User';
import type { AccountPayload } from 'utils/api/types';
import ProfileHeader from 'components/ProfileHeader';

type HeaderProps = {
  user: ?User,
  followers: ?(AccountPayload[]),
  following: ?(AccountPayload[]),
};
const UserHeader = ({ user, followers, following }: HeaderProps) => (
  <ProfileHeader
    bio={get(user, 'bio')}
    handle={get(user, 'displayName')}
    username={get(user, 'handle')}
    imgUrl={get(user, 'profpicURL')}
    followCount={get(user, 'followers') || get(followers, 'length', 0)}
    followerCount={get(following, 'length', 0)}
  />
);
export default UserHeader;
