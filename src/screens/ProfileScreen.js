// @flow
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, SectionList, Image } from 'react-native';
import { $post } from 'utils/api';
import routes from 'utils/api/routes';
import { saveUser, selectUser } from 'redux/ducks/auth';
import User from 'models/User';
import { emptyProfPicUrl } from 'constants/Values';
import { SecondaryButton } from 'components/EnseButton';
import { padding } from 'constants/Layout';

type SP = {
  user: ?User,
};
type DP = {
  saveUser: any => void,
};
type P = DP & SP;
class ProfileScreen extends React.Component<P> {
  static navigationOptions = { title: 'Profile' };

  componentDidMount() {
    this.fetchProfile();
  }

  _onUserError = e => console.error(e);

  fetchProfile = () => {
    $post(routes.accountInfo)
      .then(u => u.contents)
      .then(this.props.saveUser)
      .catch(this._onUserError);
  };

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
          <Text>{get(user, 'handle')}</Text>
        </View>
      </View>
      <View style={hs.followRow}>
        <SecondaryButton>Followers</SecondaryButton>
        <SecondaryButton>Following</SecondaryButton>
      </View>
    </View>
  );
};

const hs = StyleSheet.create({
  container: { flexDirection: 'column', padding, alignItems: 'stretch' },
  imgRow: { flexDirection: 'row' },
  infoCol: { flexDirection: 'column' },
  followRow: { flexDirection: 'row', alignItems: 'flex-start' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
});

const select = s => ({
  ...selectUser(s),
});
const dispatch = d => ({
  saveUser: u => d(saveUser(u)),
});

export default connect(
  select,
  dispatch
)(ProfileScreen);
