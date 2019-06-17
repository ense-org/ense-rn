// @flow
import React from 'react';
import { connect } from 'react-redux';
import { $get } from 'utils/api';
import routes from 'utils/api/routes';
import ProfileScreen from 'screens/ProfileScreen';
import type { NLP } from 'utils/types';

type DP = {| fetchProfile: () => Promise<any> |};
type NavP = {| userId?: ?number, userHandle: string |};
type P = { ...DP, ...NLP<NavP> };

const PublicProfile = ({ navigation }: P) => {
  const id = navigation.getParam('userId');
  const handle = navigation.getParam('userHandle');
  return (
    <ProfileScreen
      userHandle={handle}
      userId={id ? String(id) : null}
      fetchProfile={() => $get(routes.publicAccountFor(handle))}
      fetchEnses={h => $get(routes.channelFor(h))}
    />
  );
};

export default connect<P, *, *, *, *, *>(
  null,
  d => ({
    // fetchProfile: () => $post(routes.publicAccountFor()).then(u => d(_saveUser(u.contents))),
  })
)(PublicProfile);
