// @flow
import React from 'react';
import { connect } from 'react-redux';
import { $get, $post } from 'utils/api';
import routes from 'utils/api/routes';
import { saveUser as _saveUser, selectUser } from 'redux/ducks/auth';
import User from 'models/User';
import ProfileScreen from 'screens/ProfileScreen';
import type { NLP } from 'utils/types';
import EmptyListView from 'components/EmptyListView';

type OP = {};
type SP = { user: ?User };
type DP = { fetchProfile: () => Promise<any> };
type P = OP & SP & DP;

const MyProfile = ({ user, fetchProfile }: P) =>
  user && user.handle ? (
    <ProfileScreen
      userId={String(user.id)}
      fetchProfile={fetchProfile}
      fetchEnses={handle => $get(routes.channelFor(handle))}
    />
  ) : (
    (() => {
      fetchProfile();
      return <EmptyListView />;
    })()
  );

MyProfile.navigationOptions = ({ navigation }: NLP<{| title?: string |}>) => ({
  title: navigation.getParam('title', 'profile'),
});

export default connect<P, *, *, *, *, *>(
  s => ({ ...selectUser(s) }),
  d => ({
    fetchProfile: () =>
      $post(routes.accountInfo).then(u => console.log(u) || d(_saveUser(u.contents))),
  })
)(MyProfile);
