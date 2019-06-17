// @flow
import React from 'react';
import { get } from 'lodash';
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
  AccountPayload,
  AccountResponse,
  FeedResponse,
  PublicAccountId,
} from 'utils/api/types';
import Ense from 'models/Ense';
import EmptyListView from 'components/EmptyListView';
import FeedItem from 'screens/FeedScreen/FeedItem';
import ProfileHeader from 'components/ProfileHeader';
import type { BasicUserInfo } from 'models/types';

type OP = {|
  userId: PublicAccountId,
  /**
   * NB this fn is responsible for saving to the persisted store s.t. the selector
   * below can get user info from it.
   */
  fetchProfile: () => Promise<any>,
  fetchEnses: (handle: string) => Promise<FeedResponse>,
|};
type SP = {| ...BasicUserInfo, followers: AccountPayload[], following: AccountPayload[] |};
type DP = {|
  saveFollowers: (PublicAccountId, AccountPayload[]) => void,
  saveFollowing: (PublicAccountId, AccountPayload[]) => void,
|};
type Section = { data: Ense[] };

type P = {| ...OP, ...SP, ...DP, ...NP |};
type S = { feed: Section[] };

class ProfileScreen extends React.Component<P, S> {
  state = { feed: [] };

  componentDidMount() {
    this.props.fetchProfile().then(console.log);
    const handle = get(this.props, 'handle');
    const id = String(get(this.props, 'userId'));
    handle && id && this._profileData(handle, id);
  }

  componentDidUpdate(prevProps: P) {
    const { handle, userId } = this.props;
    if (handle && userId && prevProps.handle !== handle) {
      this._profileData(handle, userId);
    }
  }

  _profileData = (handle: string, id: string) => {
    // TODO error handling
    const { fetchEnses, saveFollowers, saveFollowing } = this.props;
    this.fetchFollows(handle).then(l => saveFollowing(id, l));
    this.fetchFollowers(handle).then(l => saveFollowers(id, l));
    fetchEnses(handle).then(r => {
      this.setState({
        feed: [{ data: r.enses.map(([eid, json]) => Ense.parse(json)) }],
      });
    });
  };

  // fetchChannel = (handle: string): Promise<FeedResponse> => $get(routes.channelFor(handle));

  fetchFollowers = (handle: string): Promise<AccountPayload[]> =>
    $get(routes.followersFor(handle)).then((r: AccountResponse) => r.subscriptionList);

  fetchFollows = (handle: string): Promise<AccountPayload[]> =>
    $get(routes.followingFor(handle)).then(r => r.subscriptionList);

  _renderItem = ({ item }: { item: Ense }) => <FeedItem ense={item} />;
  _listHeader = () => (
    <ProfileHeader
      userId={get(this.props, 'userId')}
      bio={get(this.props, 'bio')}
      handle={get(this.props, 'displayName')}
      username={get(this.props, 'handle')}
      imgUrl={get(this.props, 'imgUrl')}
      followCount={get(this.props, 'following.length', 0)}
      followerCount={get(this.props, 'followerCount') || get(this.props, 'followers.length', 0)}
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
