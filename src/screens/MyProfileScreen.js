// @flow
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { Image, SectionList, StyleSheet, Text, View } from 'react-native';
import { $get, $post } from 'utils/api';
import routes from 'utils/api/routes';
import { saveUser, selectUser } from 'redux/ducks/auth';
import User from 'models/User';
import { emptyProfPicUrl } from 'constants/Values';
import { SecondaryButton } from 'components/EnseButton';
import { halfPad, large, padding, paddingHorizontal, small } from 'constants/Layout';
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
import FeedItem from 'screens/FeedScreen/FeedItem';

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
    this.fetchChannel(handle).then(r =>
      this.setState({
        // $FlowIssue - not sure why flow thinks e is str here
        feed: [{ data: r.enses.map(([eid, json]) => Ense.parse(json)) }],
      })
    );
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
  _sectionHeader = () => {
    return (
      <View style={styles.sectionHead}>
        <Text>Section Head</Text>
      </View>
    );
  };

  render() {
    return (
      <SectionList
        style={styles.container}
        renderItem={this._renderItem}
        renderSectionHeader={this._sectionHeader}
        stickySectionHeadersEnabled
        keyExtractor={item => item.key}
        ListHeaderComponent={this._listHeader}
        sections={this.state.feed}
      />
    );
  }
}

type HeaderProps = {
  user: ?User,
};
const imgSize = 50;
const UserHeader = (props: HeaderProps) => {
  const { user } = props;
  return (
    <View style={hs.container}>
      <View style={hs.imgRow}>
        <Image
          source={{ uri: get(user, 'profpicURL', emptyProfPicUrl) }}
          style={{ width: imgSize, height: imgSize }}
          resizeMode="cover"
        />
        <View style={hs.infoCol}>
          <Text style={hs.displayName}>{get(user, 'displayName')}</Text>
          <Text style={hs.handle}>@{get(user, 'handle')}</Text>
        </View>
      </View>
      <View style={hs.followRow}>
        <SecondaryButton textStyle={hs.followBtn} style={hs.btnPad}>
          {get(user, 'followers')} Followers
        </SecondaryButton>
        <SecondaryButton textStyle={hs.followBtn} style={hs.btnPad}>
          Following
        </SecondaryButton>
      </View>
    </View>
  );
};

const hs = StyleSheet.create({
  container: { flexDirection: 'column', padding, alignItems: 'stretch', backgroundColor: 'white' },
  imgRow: { flexDirection: 'row' },
  infoCol: { flexDirection: 'column', paddingHorizontal },
  followRow: { flexDirection: 'row', alignItems: 'flex-start' },
  followBtn: { color: Colors.gray['4'] },
  btnPad: { padding: 0, paddingVertical: halfPad },
  displayName: { color: Colors.ense.black, fontWeight: 'bold', fontSize: large },
  handle: { color: Colors.gray['4'], fontSize: small },
  sectionHead: {
    backgroundColor: Colors.gray['0'],
    paddingVertical: halfPad,
    paddingHorizontal,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.gray['0'],
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray['0'] },
});

const select = s => ({
  ...selectUser(s),
});
const dispatch = d => ({
  saveUser: u => d(saveUser(u)),
  saveFollowers: (id, list) => d(saveFollowers([id, list])),
  saveFollowing: (id, list) => d(saveFollowing([id, list])),
});

export default connect(
  select,
  dispatch
)(MyProfileScreen);
