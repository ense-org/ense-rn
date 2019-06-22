// @flow
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { SectionList, StyleSheet, RefreshControl, View } from 'react-native';
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
import { createSelector } from 'redux-starter-kit';
import { currentlyPlaying } from 'redux/ducks/run';
import { SecondaryButton } from 'components/EnseButton';

type TabConfig = { name: string, fetch: (handle: string) => Promise<FeedResponse> };

type OP = {|
  userId: ?AccountId,
  userHandle: AccountHandle,
  /**
   * NB this fn is responsible for saving to the persisted store s.t. the selector
   * below can get user info from it.
   */
  fetchProfile: () => Promise<any>,
  tabs: TabConfig[],
|};
type SP = {| ...UserInfo, playing: ?Ense |};
type DP = {|
  saveFollowers: (AccountId, AccountPayload[]) => void,
  saveFollowing: (AccountId, AccountPayload[]) => void,
|};
type Section = { data: Ense[] };

type P = {| ...OP, ...SP, ...DP, ...NP |};
type S = {| tab: ?string, lists: { [string]: Ense[] }, refreshing: boolean |};

class ProfileScreen extends React.Component<P, S> {
  state = { tab: null, lists: {}, refreshing: false };

  componentDidMount() {
    const { fetchProfile, tabs } = this.props;
    fetchProfile();
    this._fetchFollows();
    tabs.length && this.setState({ tab: tabs[0].name });
  }

  componentDidUpdate(prevProps: P, prevState: S) {
    const { userHandle, userId } = this.props;
    const { tab } = this.state;
    if (userHandle && prevProps.userHandle !== userHandle) {
      this._fetchFeedData(false);
    }
    if (userId && prevProps.userId !== userId) {
      this._fetchFollows();
    }
    if (tab && prevState.tab !== tab) {
      this._fetchFeedData(false);
    }
  }

  _fetchFeedData = (refresh: boolean = true) => {
    const { tabs, fetchProfile } = this.props;
    const { tab } = this.state;
    const found = tab && tabs.find(t => t.name === tab);
    if (found) {
      this._fetchTab(found).finally(() => refresh && this.setState({ refreshing: false }));
      refresh && this.setState({ refreshing: true });
      refresh && fetchProfile();
      refresh && this.fetchFollows()
    }
  };

  _ensesFrom = (r: FeedResponse): Ense[] => r.enses.map(([_, json]) => Ense.parse(json));

  _fetchTab = (t: TabConfig) =>
    t
      .fetch(this.props.userHandle)
      .then(r => this.setState(s => ({ lists: { ...s.lists, [t.name]: this._ensesFrom(r) } })));

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

  _renderItem = ({ item }: { item: Ense }) => (
    <FeedItem ense={item} isPlaying={item.key === get(this.props, 'playing.key')} />
  );

  _listHeader = () => (
    <View style={{ flexDirection: 'column' }}>
      <ProfileHeader
        userId={this.props.userId}
        bio={this.props.bio}
        handle={this.props.userHandle}
        username={this.props.username}
        imgUrl={this.props.imgUrl}
        following={this.props.following}
        followers={this.props.followers}
      />
      <View style={styles.sectionHead}>
        {this.props.tabs.map(c => (
          <SecondaryButton
            style={styles.sectionBtn}
            textStyle={this.state.tab === c.name ? styles.activeTab : styles.nonActiveTab}
            key={c.name}
            onPress={() => this.setState({ tab: c.name })}
          >
            {c.name}
          </SecondaryButton>
        ))}
      </View>
    </View>
  );

  _getSections = (): Section[] => {
    const { lists, tab } = this.state;
    const enses = tab && get(lists, tab, []);
    return enses && enses.length ? [{ data: enses }] : [];
  };

  render() {
    const { refreshing } = this.state;
    return (
      <SectionList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={this._fetchFeedData} />}
        style={styles.container}
        renderItem={this._renderItem}
        stickySectionHeadersEnabled
        keyExtractor={item => item.key}
        ListEmptyComponent={EmptyListView}
        ListHeaderComponent={this._listHeader}
        sections={this._getSections()}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray['0'] },
  sectionBtn: { flex: 1, textAlign: 'center' },
  activeTab: { color: Colors.ense.pink, fontWeight: 'bold' },
  nonActiveTab: { color: Colors.gray['3'] },
  sectionHead: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal,
    paddingVertical: 12,
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
  const sel = createSelector(
    [currentlyPlaying, userInfo],
    (playing, info) => ({ ...info, playing })
  );
  // $FlowIgnore - connect can handle this actually
  return (s, p) => sel(s, p);
};
const dispatch = (d): DP => ({
  saveFollowers: (id, list) => d(_saveFollowers([id, list])),
  saveFollowing: (id, list) => d(_saveFollowing([id, list])),
});

export default connect<P, OP, *, *, *, *>(
  makeSelect,
  dispatch
)(ProfileScreen);
