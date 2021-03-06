// @flow
import * as React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { createSelector } from 'redux-starter-kit';
import type { NavigationScreenProp, NavigationState } from 'react-navigation';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SecondaryButton, MainButton } from 'components/EnseButton';
import { anonName, emptyProfPicUrl } from 'constants/Values';
import {
  padding,
  paddingHorizontal,
  halfPad,
  small,
  large,
  paddingVertical,
  quarterPad,
} from 'constants/Layout';
import Colors from 'constants/Colors';
import { displayCount } from 'utils/strings';
import type { AccountId, BasicUserInfo } from 'models/types';
import type { NP } from 'utils/types';
import { accountsList, root } from 'navigation/keys';
import User from 'models/User';
import { Icon } from 'react-native-elements';
import Spacer from 'components/Spacer';
import { myFollowing as followingMe, setSubscribed } from 'redux/ducks/accounts';
import PublicAccount from 'models/PublicAccount';

type SP = {| user: ?User, myFollowing: PublicAccount[] |};
type DP = {| follow: PublicAccount => void, unfollow: PublicAccount => void |};
type P = {|
  ...BasicUserInfo,
  following: AccountId[],
  followers: AccountId[],
  ...DP,
  ...NP,
  ...SP,
|};
const imgSize = 64;

// $FlowFixMe
const ProfileHeader = withNavigation(
  ({
    bio,
    handle,
    username,
    imgUrl,
    following,
    followers,
    navigation,
    user,
    userId,
    myFollowing,
    follow,
    unfollow,
  }: P) => {
    const followCount = following.length;
    const followerCount = followers.length;
    const followWord = followCount === 1 ? 'Follower' : 'Followers';
    const name = handle || username || anonName;
    const authedId = String(get(user, 'id'));
    const isSelf = userId === authedId;
    let button;
    if (isSelf) {
      button = (
        <SecondaryButton
          textStyle={styles.editBtn}
          style={styles.btnPad}
          onPress={() => toEditProfile(navigation)}
        >
          <Icon
            iconStyle={styles.editIcon}
            size={13}
            name="mode-edit"
            type="material"
            color={Colors.ense.pink}
          />
          Edit Profile
        </SecondaryButton>
      );
    } else if (handle && myFollowing.find(a => userId && a === userId)) {
      button = (
        <MainButton
          textStyle={styles.unfollowTxt}
          style={styles.unfollow}
          onPress={() => unfollow(handle, userId)}
        >
          Unfollow
        </MainButton>
      );
    } else if (handle) {
      button = <MainButton onPress={() => follow(handle, userId)}>Follow</MainButton>;
    } else {
      button = null;
    }
    return (
      <View style={styles.container}>
        <View style={styles.imgRow}>
          <Image
            source={{ uri: imgUrl || emptyProfPicUrl }}
            style={styles.img}
            resizeMode="cover"
          />
          <View style={styles.infoCol}>
            <Text style={styles.displayName} numberOfLines={1}>
              {username || ''}
            </Text>
            <Text style={styles.handle} numberOfLines={1}>
              @{handle}
            </Text>
          </View>
        </View>
        {bio ? <Text style={styles.bio}>{bio}</Text> : null}
        <View style={styles.followRow}>
          <SecondaryButton
            textStyle={styles.followBtn}
            style={styles.btnPad}
            onPress={pushAccounts(navigation, following, `${name} follows`)}
          >
            <Text style={styles.followCount}>{displayCount(followCount)}</Text>Following
          </SecondaryButton>
          <SecondaryButton
            textStyle={styles.followBtn}
            style={styles.btnPad}
            onPress={pushAccounts(navigation, followers, `${name}'s followers`)}
          >
            <Text style={styles.followCount}>{displayCount(followerCount)}</Text>
            {followWord}
          </SecondaryButton>
          <Spacer />
          {button}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { flexDirection: 'column', padding, alignItems: 'stretch', backgroundColor: 'white' },
  imgRow: { flexDirection: 'row' },
  img: { width: imgSize, height: imgSize, backgroundColor: Colors.gray['1'] },
  infoCol: { flexDirection: 'column', paddingHorizontal, flex: 1 },
  followRow: { flexDirection: 'row', alignItems: 'flex-end' },
  followBtn: { color: Colors.text.secondary, marginRight: padding },
  editBtn: { color: Colors.ense.pink },
  editIcon: { marginRight: quarterPad },
  followCount: { fontWeight: 'bold', marginRight: quarterPad },
  btnPad: { padding: 0, paddingVertical: halfPad },
  displayName: { color: Colors.ense.black, fontWeight: 'bold', fontSize: large },
  handle: { color: Colors.text.secondary, fontSize: small },
  bio: { paddingVertical },
  unfollow: { backgroundColor: Colors.gray['1'] },
  unfollowTxt: { color: Colors.gray['4'] },
});

const toEditProfile = (nav: NavigationScreenProp<NavigationState>) =>
  nav.navigate(root.editProfile.key);

const pushAccounts = (
  nav: NavigationScreenProp<NavigationState>,
  accounts: AccountId[],
  title: string
) => () => {
  if (!accounts.length || !nav.push) {
    return;
  }
  nav.push(accountsList.key, { accounts, title });
};

const selector = createSelector(
  ['auth.user', followingMe],
  (user, myFollowing) => ({ user, myFollowing })
);
const dispatch = d => ({
  follow: (handle, userId) => d(setSubscribed(handle, userId, true)),
  unfollow: (handle, userId) => d(setSubscribed(handle, userId, false)),
});

// $FlowIgnore
export default connect<P, *, *, *, *, *>(
  selector,
  dispatch
)(ProfileHeader);
