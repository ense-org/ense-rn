// @flow
import * as React from 'react';
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
import { displayCount } from 'utils/strings';

type HeaderProps = {
  bio: ?string,
  handle: ?string,
  username: ?string,
  imgUrl: ?string,
  followCount: ?number,
  followerCount: ?number,
};
const imgSize = 64;

const ProfileHeader = (props: HeaderProps) => {
  const { bio, handle, username, imgUrl, followCount, followerCount } = props;
  const followWord = followCount === 1 ? 'Follower' : 'Followers';
  return (
    <View style={styles.container}>
      <View style={styles.imgRow}>
        <Image
          source={{ uri: imgUrl || emptyProfPicUrl }}
          style={{ width: imgSize, height: imgSize }}
          resizeMode="cover"
        />
        <View style={styles.infoCol}>
          <Text style={styles.displayName}>{username || ''}</Text>
          <Text style={styles.handle}>@{handle}</Text>
        </View>
      </View>
      {bio ? <Text style={styles.bio}>{bio}</Text> : null}
      <View style={styles.followRow}>
        <SecondaryButton textStyle={styles.followBtn} style={styles.btnPad}>
          <Text style={styles.followCount}>{displayCount(followCount)}</Text>
          {followWord}
        </SecondaryButton>
        <SecondaryButton textStyle={styles.followBtn} style={styles.btnPad}>
          <Text style={styles.followCount}>{displayCount(followerCount)}</Text>Following
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

export default ProfileHeader;
