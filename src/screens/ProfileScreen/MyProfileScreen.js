// @flow
import React from 'react';
import { get } from 'lodash';
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
import { createSelector, PayloadAction } from 'redux-starter-kit';
import type { UserJSON } from 'models/User';
import { root } from 'navigation/keys';
import { Icon } from 'react-native-elements';
import Colors from 'constants/Colors';
import { marginRight } from 'constants/Layout';

type OP = {};
type SP = { user: ?User, myPosts: ?FeedResponse };
type DP = { fetchProfile: () => Promise<any>, saveMyPosts: FeedResponse => void };
type P = OP & SP & DP;

const emptyResponse: FeedResponse = { remoteTotal: null, enses: [] };

class MyProfile extends React.Component<P> {
  static navigationOptions = ({ navigation }: NLP<{| title?: string |}>) => ({
    title: navigation.getParam('title', 'profile'),
    headerRight: (
      <Icon
        name="settings"
        type="feather"
        onPress={() => navigation.navigate(root.settings.key)}
        color={Colors.gray['5']}
        iconStyle={{ marginRight }}
      />
    ),
  });

  componentDidMount() {
    const { user, fetchProfile, navigation } = this.props;
    if (!user || !user.handle) {
      fetchProfile().then((a: PayloadAction<UserJSON>) => {
        const name = get(a.payload, 'displayName');
        const username = get(a.payload, 'handle');
        const email = get(a.payload, 'email');
        if (!email || !name || !username) {
          navigation.navigate(root.editProfile.key, { first: true });
        }
      });
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
