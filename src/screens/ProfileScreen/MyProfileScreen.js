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

class MyProfile extends React.Component<P> {
  static navigationOptions = ({ navigation }: NLP<{| title?: string |}>) => ({
    title: navigation.getParam('title', 'profile'),
  });
  componentDidMount() {
    const { user, fetchProfile } = this.props;
    if (!user || !user.handle) {
      fetchProfile();
    }
  }
  render() {
    const { user, fetchProfile } = this.props;
    return user && user.handle ? (
      <ProfileScreen
        userHandle={user.handle}
        userId={String(user.id)}
        fetchProfile={fetchProfile}
        fetchEnses={handle => $get(routes.channelFor(handle))}
      />
    ) : (
      <EmptyListView />
    );
  }
}

export default connect<P, *, *, *, *, *>(
  s => ({ ...selectUser(s) }),
  d => ({
    fetchProfile: () =>
      $post(routes.accountInfo).then(u => console.log(u) || d(_saveUser(u.contents))),
  })
)(MyProfile);
