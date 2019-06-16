// @flow
import React from 'react';
import { connect } from 'react-redux';
import { $get, $post } from 'utils/api';
import routes from 'utils/api/routes';
import { saveUser as _saveUser, selectUser } from 'redux/ducks/auth';
import User from 'models/User';
import ProfileScreen from 'screens/ProfileScreen';

type OP = {};
type SP = { user: ?User };
type DP = { cacheProfile: () => Promise<any> };
type P = OP & SP & DP;

const MyProfile = ({ user, cacheProfile }: P) =>
  user && user.handle ? (
    <ProfileScreen
      userId={String(user.id)}
      cacheProfile={cacheProfile}
      // $FlowIgnore - sorta edgy
      fetchEnses={() => $get(routes.channelFor(user.handle))}
    />
  ) : null;

export default connect<P, *, *, *, *, *>(
  s => ({ ...selectUser(s) }),
  d => ({ cacheProfile: () => $post(routes.accountInfo).then(u => d(_saveUser(u.contents))) })
)(MyProfile);
