// @flow

import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { StyleSheet, Text, Image, View, ScrollView } from 'react-native';
import Colors from 'constants/Colors';
import Ense from 'models/Ense';
import { anonName, emptyProfPicUrl } from 'constants/Values';
import type { NLP } from 'utils/types';
import layout, {
  halfPad,
  largePad,
  marginBottom,
  marginHorizontal,
  marginLeft,
  marginTop,
  marginVertical,
  padding,
  paddingHorizontal,
  paddingLeft,
  paddingRight,
  quarterPad,
} from 'constants/Layout';
import { defaultText, largeText, smallText } from 'constants/Styles';
import Spacer from 'components/Spacer';
import { Icon, Slider } from 'react-native-elements';
import { currentEnse as playingEnse, jumpCurrentMs, setCurrentPaused } from 'redux/ducks/run';
import type { QueuedEnse } from 'redux/ducks/run';
import { toDurationStr } from 'utils/time';

type DP = {| setPaused: boolean => void, seek: number => void |};
type SP = {| currentEnse: ?QueuedEnse |};
type P = {| ...NLP<{ ense: Ense }>, ...SP, ...DP |};
type S = { imgW: number };

const imgSize = layout.window.width;
const progressHeight = 3;
const trackerSize = 16;

class FullPlayerScreen extends React.Component<P, S> {
  static navigationOptions = { gestureResponseDistance: { vertical: layout.window.width } };

  _isPaused = () => {
    const shouldPlay = get(this.props, 'currentEnse.status.shouldPlay');
    const hasPlayState = typeof shouldPlay === 'boolean';
    return !hasPlayState || shouldPlay;
  };

  _isPlaying = () => get(this.props, 'currentEnse.status.isPlaying');

  goBack = () => this.props.navigation.goBack();
  _onPlay = () => this.props.setPaused(this._isPlaying());
  _seekFwd = () => this.props.seek(10);
  _seekBack = () => this.props.seek(-10);

  render() {
    const { currentEnse } = this.props;
    if (!currentEnse) {
      return null;
    }
    const { ense, status } = currentEnse;
    const listens = `${ense.playcount} Listen${ense.playcount === 1 ? '' : 's'}`;
    const info = [listens, ense.agoString()].join(' ∙ ');
    const { positionMillis = 0, durationMillis = 0 } = status || {};
    const totalW = layout.window.width - padding * 2;
    const width = durationMillis ? (positionMillis / durationMillis) * totalW : 0;
    const playIcon = this._isPlaying() ? 'pause-circle' : 'play-circle';
    return (
      <View style={styles.root}>
        <ScrollView style={styles.scrollView}>
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
        </ScrollView>
        <View style={styles.infoRow}>
          <Text style={styles.info}>{info}</Text>
        </View>
        <View style={styles.sliderRow}>
          <Slider
            style={styles.slider}
            value={width / totalW}
            onValueChange={value => {}}
            thumbTintColor={Colors.ense.maroon}
            minimumTrackTintColor={Colors.ense.pink}
            maximumTrackTintColor={Colors.gray['2']}
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
            onPress={this._seekBack}
          />
          <Icon
            iconStyle={[styles.icon, { padding: quarterPad }]}
            size={48}
            name={playIcon}
            type="feather"
            color={Colors.gray['5']}
            onPress={this._onPlay}
            underlayColor="transparent"
          />
          <Icon
            iconStyle={styles.icon}
            size={28}
            name="forward-10"
            type="material"
            color={Colors.gray['5']}
            onPress={this._seekFwd}
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
  root: {
    flex: 1,
    backgroundColor: Colors.gray['0'],
    alignItems: 'flex-start',
    flexDirection: 'column',
    borderTopColor: Colors.gray['1'],
    borderTopWidth: 1,
  },
  scrollView: { flex: 1, width: imgSize },
  img: {
    width: imgSize,
    height: imgSize,
    alignSelf: 'center',
  },
  title: { ...defaultText, marginTop, alignSelf: 'stretch', paddingHorizontal },
  info: { color: Colors.gray['3'], paddingHorizontal },
  username: { ...largeText, fontWeight: 'bold', marginTop, paddingHorizontal },
  handle: { color: Colors.gray['4'], marginTop: quarterPad, paddingHorizontal },
  infoRow: {
    flexDirection: 'row',
    marginBottom,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingHorizontal },
  icon: { padding },
  sliderRow: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal,
  },
  durationTxtRow: { flexDirection: 'row' },
  durationTxt: { ...smallText, color: Colors.gray['3'] },
  chevRow: { flexDirection: 'row', justifyContent: 'center', alignSelf: 'stretch' },
});

export default connect<*, *, *, *, *, *>(
  s => ({ currentEnse: playingEnse(s) }),
  d => ({
    setPaused: p => d(setCurrentPaused(p)),
    seek: (sec: number) => d(jumpCurrentMs(sec * 1e3)),
  })
)(FullPlayerScreen);
