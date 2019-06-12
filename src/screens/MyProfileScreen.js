// @flow
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, SectionList, Image } from 'react-native';
import { $get, $post } from 'utils/api';
import routes from 'utils/api/routes';
import { saveUser, selectUser } from 'redux/ducks/auth';
import User from 'models/User';
import { emptyProfPicUrl } from 'constants/Values';
import { SecondaryButton } from 'components/EnseButton';
import { padding } from 'constants/Layout';
import { saveFollowers, saveFollowing } from 'redux/ducks/accounts';
import Colors from 'constants/Colors';
import type { NP } from 'utils/types';
import type { AccountPayload, PublicAccountId } from 'utils/api/types';

type OP = {};
type SP = {
  user: ?User,
};
type DP = {
  saveUser: any => void,
  saveFollowers: (PublicAccountId, AccountPayload[]) => void,
  saveFollowing: (PublicAccountId, AccountPayload[]) => void,
};
type P = OP & NP & SP & DP;
class MyProfileScreen extends React.Component<P> {
  static navigationOptions = { title: 'Profile' };

  componentDidMount() {
    this.fetchProfile();
    const handle = get(this.props, 'user.handle');
    const id = String(get(this.props, 'user.id'));
    handle && id && this._followRequests(handle, id);
  }

  componentDidUpdate(prevProps: P) {
    const handle = get(this.props, 'user.handle');
    const id = String(get(this.props, 'user.id'));
    if (handle && id && get(prevProps, 'user.handle') !== handle) {
      this._followRequests(handle, id);
    }
  }

  _followRequests = (handle: string, id: string) => {
    this.fetchFollows(handle).then(l => this.props.saveFollowing(id, l));
    this.fetchFollowers(handle).then(l => this.props.saveFollowers(id, l));
  };

  _onFetchError = e => console.error(e);

  fetchProfile = () => {
    $post(routes.accountInfo)
      .then(u => u.contents)
      .then(this.props.saveUser)
      .catch(this._onFetchError);
  };

  fetchFollows = (handle: string): Promise<AccountPayload[]> =>
    $get(routes.followingFor(handle))
      .then(r => get(r, 'subscriptionList'), [])
      .catch(this._onFetchError);

  fetchFollowers = (handle: string): Promise<AccountPayload[]> =>
    $get(routes.followersFor(handle))
      .then(r => get(r, 'subscriptionList', []))
      .catch(this._onFetchError);

  render() {
    const { user } = this.props;
    return (
      <SectionList
        style={styles.container}
        renderItem={() => <Text>item</Text>}
        renderSectionHeader={i => <Text>section head</Text>}
        stickySectionHeadersEnabled
        keyExtractor={(item, index) => index}
        ListHeaderComponent={() => <UserHeader user={user} />}
        sections={[]}
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
          <Text>{get(user, 'displayName')}</Text>
          <Text>@{get(user, 'handle')}</Text>
        </View>
      </View>
      <View style={hs.followRow}>
        <SecondaryButton textStyle={hs.followBtn}>
          {get(user, 'followers')} Followers
        </SecondaryButton>
        <SecondaryButton textStyle={hs.followBtn}>Following</SecondaryButton>
      </View>
    </View>
  );
};

const hs = StyleSheet.create({
  container: { flexDirection: 'column', padding, alignItems: 'stretch' },
  imgRow: { flexDirection: 'row' },
  infoCol: { flexDirection: 'column' },
  followRow: { flexDirection: 'row', alignItems: 'flex-start' },
  followBtn: { color: Colors.gray['4'] },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
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
