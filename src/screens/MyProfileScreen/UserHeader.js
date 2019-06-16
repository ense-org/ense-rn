// @flow
import * as React from 'react';
import { get } from 'lodash';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SecondaryButton } from 'components/EnseButton';
import { emptyProfPicUrl } from 'constants/Values';
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
import User from 'models/User';
import type { AccountPayload } from 'utils/api/types';
import { displayCount } from 'utils/strings';

type HeaderProps = {
  user: ?User,
  followers: ?(AccountPayload[]),
  following: ?(AccountPayload[]),
};
const imgSize = 64;

const UserHeader = (props: HeaderProps) => {
  const { user, followers, following } = props;
  const bio = get(user, 'bio');
  const followCount = get(user, 'followers') || get(followers, 'length', 0);
  const followingCount = get(user, 'following') || get(following, 'length', 0);
  const followWord = followCount === 1 ? 'Follower' : 'Followers';
  return (
    <View style={styles.container}>
      <View style={styles.imgRow}>
        <Image
          source={{ uri: get(user, 'profpicURL', emptyProfPicUrl) }}
          style={{ width: imgSize, height: imgSize }}
          resizeMode="cover"
        />
        <View style={styles.infoCol}>
          <Text style={styles.displayName}>{get(user, 'displayName')}</Text>
          <Text style={styles.handle}>@{get(user, 'handle')}</Text>
        </View>
      </View>
      {bio ? <Text style={styles.bio}>{bio}</Text> : null}
      <View style={styles.followRow}>
        <SecondaryButton textStyle={styles.followBtn} style={styles.btnPad}>
          <Text style={styles.followCount}>{displayCount(followCount)}</Text>
          {followWord}
        </SecondaryButton>
        <SecondaryButton textStyle={styles.followBtn} style={styles.btnPad}>
          <Text style={styles.followCount}>{displayCount(followingCount)}</Text>Following
        </SecondaryButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'column', padding, alignItems: 'stretch', backgroundColor: 'white' },
  imgRow: { flexDirection: 'row' },
  infoCol: { flexDirection: 'column', paddingHorizontal },
  followRow: { flexDirection: 'row', alignItems: 'flex-start' },
  followBtn: { color: Colors.text.secondary, marginRight: padding },
  followCount: { fontWeight: 'bold', marginRight: quarterPad },
  btnPad: { padding: 0, paddingVertical: halfPad },
  displayName: { color: Colors.ense.black, fontWeight: 'bold', fontSize: large },
  handle: { color: Colors.text.secondary, fontSize: small },
  bio: { paddingVertical },
});

export default UserHeader;
