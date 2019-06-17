// @flow
import React from 'react';
import { connect } from 'react-redux';
import { $get, $post } from 'utils/api';
import routes from 'utils/api/routes';
import ProfileScreen from 'screens/ProfileScreen';
import type { NLP } from 'utils/types';

type DP = {| fetchProfile: () => Promise<any> |};
type NavP = {| userId: number, handle: string |};
type P = { ...DP, ...NLP<NavP> };

const PublicProfile = ({ navigation }: P) => {
  return (
    <ProfileScreen
      userId={String(navigation.getParam('userId'))}
      fetchProfile={() => $post(routes.publicAccountFor(navigation.getParam('handle')))}
      fetchEnses={handle => $get(routes.channelFor(handle))}
    />
  );
};

export default connect<P, *, *, *, *, *>(
  null,
  d => ({
    // fetchProfile: () => $post(routes.publicAccountFor()).then(u => d(_saveUser(u.contents))),
  })
)(PublicProfile);
