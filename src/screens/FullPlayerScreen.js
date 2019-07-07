// @flow

import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from 'constants/Colors';
import Ense from 'models/Ense';
import { anonName, emptyProfPicUrl } from 'constants/Values';
import type { NLP } from 'utils/types';
import layout, {
  halfPad,
  marginBottom,
  marginTop,
  padding,
  paddingHorizontal,
  quarterPad,
} from 'constants/Layout';
import { defaultText, largeText, smallText } from 'constants/Styles';
import Spacer from 'components/Spacer';
import { Icon, Slider } from 'react-native-elements';
import type { QueuedEnse } from 'redux/ducks/run';
import {
  currentEnse as playingEnse,
  playBack as _playBack,
  playNext as _playNext,
  seekCurrentRelative,
  seekCurrentTo,
  setCurrentPaused,
} from 'redux/ducks/run';
import { toDurationStr as toDuration } from 'utils/time';
import { PlaybackStatus } from 'expo-av/build/AV';

type DP = {|
  setPaused: boolean => void,
  seek: number => void,
  seekAbs: number => Promise<any>,
  playNext: () => void,
  playBack: () => void,
|};
type SP = {| currentEnse: ?QueuedEnse |};
type P = {| ...NLP<{ ense: Ense }>, ...SP, ...DP |};
type S = {| seek: ?number |};

const imgSize = layout.window.width;

class FullPlayerScreen extends React.Component<P, S> {
  state = { seek: null };
  static navigationOptions = { gestureResponseDistance: { vertical: layout.window.width } };

  _isPlaying = () => get(this.props, 'currentEnse.status.isPlaying');
  goBack = () => this.props.navigation.goBack();
  _onPlay = () => this.props.setPaused(this._isPlaying());
  _seekFwd = () => this.props.seek(10);
  _seekBack = () => this.props.seek(-10);
  _setSeek = (seek: number) => this.setState({ seek });
  _playIcon = () => (this._isPlaying() ? 'pause-circle' : 'play-circle');
  _onSeekFinish = async (progress: number) => {
    await this.props.seekAbs(progress * get(this.props.currentEnse, 'status.durationMillis', 0));
    this.setState({ seek: null });
  };
  _posDuration = (status: ?PlaybackStatus) => {
    const { positionMillis = 0, durationMillis = 0 } = status || {};
    return [positionMillis, durationMillis];
  };
  _enseDetailInfo = (ense: Ense): string => {
    const listens = `${ense.playcount} Listen${ense.playcount === 1 ? '' : 's'}`;
    return [listens, ense.agoString()].join(' ∙ ');
  };

  componentDidUpdate(prevProps: P) {
    if (!this.props.currentEnse && prevProps.currentEnse) {
      this.props.navigation.goBack();
    }
  }

  render() {
    const { currentEnse, playNext, playBack } = this.props;
    if (!currentEnse) {
      return null;
    }
    const { seek } = this.state;
    const { ense, status } = currentEnse;
    const [pos, duration] = this._posDuration(status);
    return (
      <View style={styles.root}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
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
          <Text style={styles.info}>{this._enseDetailInfo(ense)}</Text>
        </View>
        <View style={styles.sliderRow}>
          <Slider
            value={seek || (duration ? pos / duration : 0)}
            onValueChange={this._setSeek}
            thumbTintColor={Colors.ense.maroon}
            minimumTrackTintColor={Colors.ense.pink}
            maximumTrackTintColor={Colors.gray['2']}
            onSlidingComplete={this._onSeekFinish}
          />
          <View style={styles.durationTxtRow}>
            <Text style={styles.durationTxt}>{toDuration(pos / 1000)}</Text>
            <Spacer />
            <Text style={styles.durationTxt}>-{toDuration((duration - pos) / 1000)}</Text>
          </View>
        </View>
        <View style={styles.iconRow}>
          <Icon
            iconStyle={styles.icon}
            size={28}
            name="skip-back"
            type="feather"
            onPress={playBack}
            color={Colors.gray['5']}
          />
          <Icon
            iconStyle={styles.icon}
            size={28}
            name="replay-10"
            type="material"
            color={Colors.gray['5']}
            onPress={this._seekBack}
            underlayColor="transparent"
          />
          <Icon
            iconStyle={[styles.icon, { paddingVertical: quarterPad }]}
            size={44}
            name={this._playIcon()}
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
            underlayColor="transparent"
          />
          <Icon
            iconStyle={styles.icon}
            size={28}
            name="skip-forward"
            type="feather"
            onPress={playNext}
            color={Colors.gray['5']}
          />
        </View>
        <View style={styles.chevRow}>
          <Icon
            iconStyle={styles.icon}
            underlayColor="transparent"
            size={32}
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
  img: { width: imgSize, height: imgSize, alignSelf: 'center', backgroundColor: Colors.gray['1'] },
  title: { ...defaultText, padding, alignSelf: 'stretch' },
  info: { color: Colors.gray['3'], paddingHorizontal },
  username: { ...largeText, fontWeight: 'bold', marginTop, paddingHorizontal },
  handle: { color: Colors.gray['4'], marginTop: quarterPad, paddingHorizontal },
  infoRow: {
    flexDirection: 'row',
    marginBottom: halfPad,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingHorizontal },
  icon: { padding: halfPad },
  sliderRow: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal,
  },
  durationTxtRow: { flexDirection: 'row', marginTop: -6 },
  durationTxt: { ...smallText, color: Colors.gray['3'] },
  chevRow: { flexDirection: 'row', justifyContent: 'center', alignSelf: 'stretch' },
});

export default connect<*, *, *, *, *, *>(
  s => ({ currentEnse: playingEnse(s) }),
  d => ({
    setPaused: p => d(setCurrentPaused(p)),
    seek: (sec: number) => d(seekCurrentRelative(sec * 1e3)),
    seekAbs: (ms: number) => d(seekCurrentTo(ms)),
    playNext: () => d(_playNext),
    playBack: () => d(_playBack),
  })
)(FullPlayerScreen);
