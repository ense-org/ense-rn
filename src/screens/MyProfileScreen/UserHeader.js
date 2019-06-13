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
} from 'constants/Layout';
import Colors from 'constants/Colors';
import User from 'models/User';

type HeaderProps = {
  user: ?User,
};
const imgSize = 64;

const UserHeader = (props: HeaderProps) => {
  const { user } = props;
  const bio = get(user, 'bio');
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
      {bio ? <Text style={hs.bio}>{bio}</Text> : null}
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
  bio: { paddingVertical },
});

export default UserHeader;
