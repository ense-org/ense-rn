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
import type { FeedResponse } from 'utils/api/types';

type OP = {};
type SP = { user: ?User };
type DP = { fetchProfile: () => Promise<any> };
type P = OP & SP & DP;

const emptyResponse: FeedResponse = { remoteTotal: null, enses: [] };

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

  _fetchFavorites = () => {
    const { user } = this.props;
    return user && user.favorites
      ? $get(routes.playlistNamed(user.favorites))
      : Promise.resolve(emptyResponse);
  };

  render() {
    const { user, fetchProfile } = this.props;
    return user && user.handle ? (
      <ProfileScreen
        userHandle={user.handle}
        userId={String(user.id)}
        fetchProfile={fetchProfile}
        tabs={[
          { name: 'Posts', fetch: () => $get(routes.myEnses) },
          { name: 'Mentions', fetch: () => $get(routes.mentionsMe) },
          { name: 'Favorites', fetch: this._fetchFavorites },
        ]}
      />
    ) : (
      <EmptyListView />
    );
  }
}

export default connect<P, *, *, *, *, *>(
  s => ({ ...selectUser(s) }),
  d => ({
    fetchProfile: () => $post(routes.accountInfo).then(u => d(_saveUser(u.contents))),
  })
)(MyProfile);
