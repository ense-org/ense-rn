// @flow
import React from 'react';
import { connect } from 'react-redux';
import { $get, $post } from 'utils/api';
import routes from 'utils/api/routes';
import { saveUser as _saveUser, userSelector } from 'redux/ducks/auth';
import User from 'models/User';
import ProfileScreen from 'screens/ProfileScreen';
import type { NLP } from 'utils/types';
import EmptyListView from 'components/EmptyListView';
import type { FeedResponse } from 'utils/api/types';
import { setMyPosts } from 'redux/ducks/feed';
import { createSelector } from 'redux-starter-kit';

type OP = {};
type SP = { user: ?User, myPosts: ?FeedResponse };
type DP = { fetchProfile: () => Promise<any>, saveMyPosts: FeedResponse => void };
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

  _onMyPosts = (r: FeedResponse) => {
    this.props.saveMyPosts(r);
    return r;
  };

  render() {
    const { user, fetchProfile, myPosts } = this.props;
    return user && user.handle ? (
      <ProfileScreen
        userHandle={user.handle}
        userId={String(user.id)}
        fetchProfile={fetchProfile}
        tabs={[
          {
            name: 'Posts',
            fetch: () => $get(routes.myEnses).then(this._onMyPosts),
            cache: myPosts,
          },
          { name: 'Mentions', fetch: () => $get(routes.mentionsMe) },
          { name: 'Favorites', fetch: this._fetchFavorites },
        ]}
      />
    ) : (
      <EmptyListView />
    );
  }
}

const selector = createSelector(
  [userSelector, 'feed.myPostsCache'],
  (user, myPosts) => ({ user, myPosts })
);

export default connect<P, *, *, *, *, *>(
  selector,
  d => ({
    fetchProfile: () => $post(routes.accountInfo).then(u => d(_saveUser(u.contents))),
    saveMyPosts: (r: FeedResponse) => d(setMyPosts(r)),
  })
)(MyProfile);
