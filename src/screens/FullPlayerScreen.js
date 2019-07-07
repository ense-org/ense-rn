// @flow

import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, Image, View } from 'react-native';
import { SafeAreaView } from '@react-navigation/native';
import Colors from 'constants/Colors';
import Ense from 'models/Ense';
import { anonName, emptyProfPicUrl } from 'constants/Values';
import type { NLP } from 'utils/types';
import layout, {
  halfPad,
  largePad,
  marginBottom,
  marginTop,
  marginVertical,
  padding,
  paddingHorizontal,
  quarterPad,
} from 'constants/Layout';
import { defaultText, largeText, smallText } from 'constants/Styles';
import Spacer from 'components/Spacer';
import { Icon } from 'react-native-elements';
import { currentEnse as playingEnse } from 'redux/ducks/run';
import type { QueuedEnse } from 'redux/ducks/run';
import { toDurationStr } from 'utils/time';

type SP = {| currentEnse: ?QueuedEnse |};
type P = {| ...NLP<{ ense: Ense }>, ...SP |};
type S = { imgW: number };

const imgSize = layout.window.width;
const progressHeight = 3;
const trackerSize = 16;

class FullPlayerScreen extends React.Component<P, S> {
  goBack = () => this.props.navigation.goBack();

  render() {
    // const ense = this.props.navigation.getParam('ense');
    const { currentEnse } = this.props;
    if (!currentEnse) {
      return null;
    }
    const { ense, status } = currentEnse;
    const listens = `${ense.playcount} Listen${ense.playcount === 1 ? '' : 's'}`;
    const info = [listens, ense.agoString()].join(' ∙ ');
    const { positionMillis = 0, durationMillis = 0 } = status || {};
    const width = durationMillis
      ? (positionMillis / durationMillis) * (layout.window.width - padding * 2)
      : 0;
    return (
      <View style={styles.root}>
        <Image
          source={{ uri: ense.profpic || emptyProfPicUrl }}
          style={styles.img}
          resizeMode="cover"
        />
        <Text style={styles.username} numberOfLines={1}>
          {ense.username || anonName}
        </Text>
        {ense.userhandle && (
          <Text style={styles.handle} numberOfLines={1}>
            @{ense.userhandle}
          </Text>
        )}
        <Text style={styles.title}>{ense.title}</Text>
        <Spacer />
        <View style={styles.infoRow}>
          <Text style={styles.info}>{info}</Text>
        </View>
        <View style={styles.sliderRow}>
          <View style={styles.durationBack} />
          <View style={[styles.durationFront, { width: width || 0 }]} />
          <Icon
            iconStyle={[styles.tracker, { marginLeft: width }]}
            size={trackerSize}
            name="circle"
            type="font-awesome"
            color={Colors.ense.maroon}
          />
          <View style={styles.durationTxtRow}>
            <Text style={styles.durationTxt}>{toDurationStr(positionMillis / 1000)}</Text>
            <Spacer />
            <Text style={styles.durationTxt}>
              -{toDurationStr((durationMillis - positionMillis) / 1000)}
            </Text>
          </View>
        </View>
        <View style={styles.iconRow}>
          <Icon
            iconStyle={styles.icon}
            size={28}
            name="skip-back"
            type="feather"
            color={Colors.gray['5']}
          />
          <Icon
            iconStyle={styles.icon}
            size={28}
            name="replay-10"
            type="material"
            color={Colors.gray['5']}
          />
          <Icon
            iconStyle={styles.icon}
            size={48}
            name="play-circle"
            type="feather"
            color={Colors.gray['5']}
          />
          <Icon
            iconStyle={styles.icon}
            size={28}
            name="forward-10"
            type="material"
            color={Colors.gray['5']}
          />
          <Icon
            iconStyle={styles.icon}
            size={28}
            name="skip-forward"
            type="feather"
            color={Colors.gray['5']}
          />
        </View>
        <View style={styles.chevRow}>
          <Icon
            iconStyle={styles.icon}
            underlayColor="transparent"
            size={28}
            name="chevron-down"
            type="feather"
            color={Colors.gray['5']}
            onPress={this.goBack}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sav: { flex: 1 },
  root: {
    flex: 1,
    backgroundColor: Colors.gray['0'],
    alignItems: 'flex-start',
    flexDirection: 'column',
    padding,
    paddingTop: 0,
  },
  img: {
    width: imgSize,
    height: imgSize,
    alignSelf: 'center',
    // borderRadius: imgSize / 2,
    // backgroundColor: Colors.gray['1'],
    // borderWidth: 2,
    // borderColor: Colors.gray['2'],
  },
  title: { ...defaultText, marginTop, alignSelf: 'stretch' },
  info: { color: Colors.gray['3'] },
  username: { ...largeText, fontWeight: 'bold', marginTop },
  handle: { color: Colors.gray['4'], marginTop: quarterPad },
  infoRow: {
    flexDirection: 'row',
    marginBottom: largePad,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center' },
  icon: { padding },
  durationBack: {
    height: progressHeight,
    backgroundColor: Colors.gray['2'],
    alignSelf: 'stretch',
  },
  durationFront: {
    marginTop: -progressHeight,
    height: progressHeight,
    backgroundColor: Colors.ense.pink,
    borderRadius: progressHeight / 2,
  },
  sliderRow: { alignSelf: 'stretch', flexDirection: 'column', alignItems: 'flex-start' },
  tracker: { marginTop: -(trackerSize / 2) - progressHeight / 2 },
  durationTxtRow: { flexDirection: 'row' },
  durationTxt: { ...smallText, color: Colors.gray['3'] },
  chevRow: { flexDirection: 'row', justifyContent: 'center', alignSelf: 'stretch' },
});

export default connect<*, *, *, *, *, *>(s => ({ currentEnse: playingEnse(s) }))(FullPlayerScreen);
