// @flow
import React from 'react';
import { connect } from 'react-redux';
import { $get } from 'utils/api';
import routes from 'utils/api/routes';
import ProfileScreen from 'screens/ProfileScreen';
import type { NLP } from 'utils/types';
import { cacheProfiles } from 'redux/ducks/accounts';

type DP = {| cacheProfile: () => void |};
type NavP = {| userId?: ?number, userHandle: string |};
type P = { ...DP, ...NLP<NavP> };

const PublicProfile = ({ navigation, cacheProfile }: P) => {
  const id = navigation.getParam('userId');
  const handle = navigation.getParam('userHandle');
  return (
    <ProfileScreen
      userHandle={handle}
      userId={id ? String(id) : null}
      fetchProfile={() => $get(routes.publicAccountFor(handle)).then(cacheProfile)}
      tabs={[
        { name: 'Posts', fetch: h => $get(routes.channelFor(h)) },
        { name: 'Mentions', fetch: h => $get(routes.mentionsHandle(h)) },
        { name: 'Between You', fetch: h => $get(routes.betweenYou(h)) },
      ]}
    />
  );
};

export default connect<P, *, *, DP, *, *>(
  null,
  (d): DP => ({ cacheProfile: p => d(cacheProfiles(p)) })
)(PublicProfile);
