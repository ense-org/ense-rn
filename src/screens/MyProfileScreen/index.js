// @flow
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { $get, $post } from 'utils/api';
import routes from 'utils/api/routes';
import { saveUser, selectUser } from 'redux/ducks/auth';
import User from 'models/User';
import { paddingHorizontal } from 'constants/Layout';
import { saveFollowers, saveFollowing } from 'redux/ducks/accounts';
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
import UserHeader from './UserHeader';

type OP = {};
type SP = {
  user: ?User,
};
type DP = {
  saveUser: any => void,
  saveFollowers: (PublicAccountId, AccountPayload[]) => void,
  saveFollowing: (PublicAccountId, AccountPayload[]) => void,
};
type Section = { data: Ense[] };

type P = OP & NP & SP & DP;
type S = {
  feed: Section[],
};
class MyProfileScreen extends React.Component<P, S> {
  state = { feed: [] };
  static navigationOptions = { title: 'Profile' };

  componentDidMount() {
    this.fetchProfile();
    const handle = get(this.props, 'user.handle');
    const id = String(get(this.props, 'user.id'));
    handle && id && this._profileData(handle, id);
  }

  componentDidUpdate(prevProps: P) {
    const handle = get(this.props, 'user.handle');
    const id = String(get(this.props, 'user.id'));
    if (handle && id && get(prevProps, 'user.handle') !== handle) {
      this._profileData(handle, id);
    }
  }

  _profileData = (handle: string, id: string) => {
    // TODO error handling
    this.fetchFollows(handle).then(l => this.props.saveFollowing(id, l));
    this.fetchFollowers(handle).then(l => this.props.saveFollowers(id, l));
    this.fetchChannel(handle).then(r => {
      this.setState({
        // $FlowIssue - not sure why flow thinks e is str here
        feed: [{ data: r.enses.map(([eid, json]) => Ense.parse(json)) }],
      });
    });
  };

  fetchProfile = () => {
    $post(routes.accountInfo)
      .then(u => u.contents)
      .then(this.props.saveUser);
  };

  fetchChannel = (handle: string): Promise<FeedResponse> => $get(routes.channelFor(handle));

  fetchFollowers = (handle: string): Promise<AccountPayload[]> =>
    $get(routes.followersFor(handle)).then((r: AccountResponse) => r.subscriptionList);

  fetchFollows = (handle: string): Promise<AccountPayload[]> =>
    $get(routes.followingFor(handle)).then(r => r.subscriptionList);

  _renderItem = ({ item }) => <FeedItem ense={item} />;
  _listHeader = () => <UserHeader user={this.props.user} />;

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

const select = s => ({ ...selectUser(s) });
const dispatch = d => ({
  saveUser: u => d(saveUser(u)),
  saveFollowers: (id, list) => d(saveFollowers([id, list])),
  saveFollowing: (id, list) => d(saveFollowing([id, list])),
});

export default connect(
  select,
  dispatch
)(MyProfileScreen);
