// @flow
import React from 'react';
import { connect } from 'react-redux';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { $get } from 'utils/api';
import routes from 'utils/api/routes';
import { paddingHorizontal } from 'constants/Layout';
import {
  makeUserInfoSelector,
  saveFollowers as _saveFollowers,
  saveFollowing as _saveFollowing,
} from 'redux/ducks/accounts';
import Colors from 'constants/Colors';
import type { NP } from 'utils/types';
import type {
  AccountHandle,
  AccountPayload,
  AccountResponse,
  FeedResponse,
  AccountId,
} from 'utils/api/types';
import Ense from 'models/Ense';
import EmptyListView from 'components/EmptyListView';
import FeedItem from 'screens/FeedScreen/FeedItem';
import ProfileHeader from 'components/ProfileHeader';
import type { UserInfo } from 'redux/ducks/accounts';

type OP = {|
  userId: ?AccountId,
  userHandle: AccountHandle,
  /**
   * NB this fn is responsible for saving to the persisted store s.t. the selector
   * below can get user info from it.
   */
  fetchProfile: () => Promise<any>,
  fetchEnses: (handle: string) => Promise<FeedResponse>,
|};
type SP = {| ...UserInfo |};
type DP = {|
  saveFollowers: (AccountId, AccountPayload[]) => void,
  saveFollowing: (AccountId, AccountPayload[]) => void,
|};
type Section = { data: Ense[] };

type P = {| ...OP, ...SP, ...DP, ...NP |};
type S = {| feed: Section[] |};

class ProfileScreen extends React.Component<P, S> {
  state = { feed: [] };

  componentDidMount() {
    this.props.fetchProfile();
    this._profileData(this.props.userHandle);
    this._fetchFollows();
  }

  componentDidUpdate(prevProps: P) {
    const { userHandle, userId } = this.props;
    if (userHandle && prevProps.userHandle !== userHandle) {
      this._profileData(userHandle);
    }
    if (userId && prevProps.userId !== userId) {
      this._fetchFollows();
    }
  }

  _sectionFrom = (r: FeedResponse) => ({ data: r.enses.map(([_, json]) => Ense.parse(json)) });
  _setFeed = (r: FeedResponse) => this.setState({ feed: [this._sectionFrom(r)] });

  _profileData = (handle: string) => {
    // TODO error handling
    const { fetchEnses } = this.props;
    fetchEnses(handle).then(this._setFeed);
  };

  _fetchFollows = () => {
    const { userHandle, userId } = this.props;
    const { saveFollowers, saveFollowing } = this.props;
    if (!userHandle || !userId) {
      return;
    }
    this.fetchFollows(userHandle).then(l => saveFollowing(userId, l));
    this.fetchFollowers(userHandle).then(l => saveFollowers(userId, l));
  };

  fetchFollowers = (handle: string): Promise<AccountPayload[]> =>
    $get(routes.followersFor(handle)).then((r: AccountResponse) => r.subscriptionList);

  fetchFollows = (handle: string): Promise<AccountPayload[]> =>
    $get(routes.followingFor(handle)).then(r => r.subscriptionList);

  _renderItem = ({ item }: { item: Ense }) => <FeedItem ense={item} />;
  _listHeader = () => (
    <ProfileHeader
      userId={this.props.userId}
      bio={this.props.bio}
      handle={this.props.userHandle}
      username={this.props.username}
      imgUrl={this.props.imgUrl}
      followCount={this.props.following.length}
      followerCount={this.props.followerCount || this.props.followers.length}
    />
  );

  _sectionHeader = () => (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionBtn}>Posts</Text>
      <Text style={styles.sectionBtn}>Mentions</Text>
      <Text style={styles.sectionBtn}>Favorites</Text>
    </View>
  );

  render() {
    return (
      <SectionList
        style={styles.container}
        renderItem={this._renderItem}
        renderSectionHeader={this._sectionHeader}
        stickySectionHeadersEnabled
        keyExtractor={item => item.key}
        ListEmptyComponent={EmptyListView}
        ListHeaderComponent={this._listHeader}
        sections={this.state.feed}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray['0'] },
  sectionBtn: { flex: 1, textAlign: 'center' },
  sectionHead: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.gray['1'],
  },
});

/*
  Pattern to select with props & keep memoization. See this:
  https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances
 */
const makeSelect = () => {
  const userInfo = makeUserInfoSelector();
  // $FlowIgnore - connect can handle this actually
  return (s, p) => userInfo(s, p);
};
const dispatch = (d): DP => ({
  saveFollowers: (id, list) => d(_saveFollowers([id, list])),
  saveFollowing: (id, list) => d(_saveFollowing([id, list])),
});

export default connect<P, OP, *, *, *, *>(
  makeSelect,
  dispatch
)(ProfileScreen);
