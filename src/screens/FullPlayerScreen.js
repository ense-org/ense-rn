// @flow

import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { Image, ScrollView, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
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
import { createSelector } from 'redux-starter-kit';
import ParsedText from 'components/ParsedText';
import parser from 'utils/textLink';

type DP = {|
  setPaused: boolean => void,
  seek: number => void,
  seekAbs: number => Promise<any>,
  playNext: () => void,
  playBack: () => void,
|};
type SP = {| currentEnse: ?QueuedEnse, playlistLen: number |};
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

  render() {
    const { currentEnse, playNext, playBack, navigation } = this.props;
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
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={this.goBack}>
            <View>
              <Image
                source={{ uri: ense.profpic || emptyProfPicUrl }}
                style={styles.img}
                resizeMode="cover"
              />
              <View style={styles.chevDown}>
                <Icon name="ios-arrow-down" type="ionicon" color={Colors.gray['1']} size={32} />
              </View>
            </View>
          </TouchableWithoutFeedback>
          <Text style={styles.username} numberOfLines={1}>
            {ense.username || anonName}
          </Text>
          {ense.userhandle && (
            <Text style={styles.handle} numberOfLines={1}>
              @{ense.userhandle}
            </Text>
          )}
          <ParsedText style={styles.title} parse={parser(navigation, largeText)}>
            {ense.title}
          </ParsedText>
          <View style={styles.infoRow}>
            <Text style={styles.info}>{this._enseDetailInfo(ense)}</Text>
          </View>
        </ScrollView>
        <View style={styles.sliderRow}>
          <View style={styles.durationTxtRow}>
            <Text style={styles.durationTxt}>{toDuration(pos / 1000)}</Text>
            <Spacer />
            <Text style={styles.durationTxt}>-{toDuration((duration - pos) / 1000)}</Text>
          </View>
          <Slider
            style={styles.slider}
            value={seek || (duration ? pos / duration : 0)}
            onValueChange={this._setSeek}
            thumbTintColor={Colors.ense.maroon}
            minimumTrackTintColor={Colors.ense.pink}
            maximumTrackTintColor={Colors.gray['2']}
            onSlidingComplete={this._onSeekFinish}
          />
        </View>
        <View style={styles.iconRow}>
          <Icon
            iconStyle={styles.icon}
            size={28}
            name="skip-back"
            type="feather"
            onPress={playBack}
            color={Colors.gray['5']}
            underlayColor="transparent"
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
            underlayColor="transparent"
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
  scrollView: { flex: 1, width: imgSize, backgroundColor: 'white' },
  img: { width: imgSize, height: imgSize, alignSelf: 'center', backgroundColor: Colors.gray['1'] },
  title: { ...largeText, padding, alignSelf: 'stretch' },
  info: { color: Colors.gray['3'], paddingHorizontal },
  username: { ...largeText, fontWeight: 'bold', marginTop, paddingHorizontal },
  handle: { color: Colors.gray['4'], marginTop: quarterPad, paddingHorizontal },
  infoRow: {
    flexDirection: 'row',
    marginBottom: halfPad,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal,
    marginBottom,
  },
  icon: { padding: halfPad },
  sliderRow: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal,
    paddingTop: halfPad,
    borderTopColor: Colors.gray['2'],
    borderTopWidth: 2,
  },
  slider: { marginTop: -8 },
  durationTxtRow: { flexDirection: 'row' },
  durationTxt: { ...smallText, color: Colors.gray['3'] },
  chevDown: {
    position: 'absolute',
    top: getStatusBarHeight() + halfPad,
    left: padding,
  },
});

const selector = createSelector(
  [playingEnse, 'run.playlist'],
  (currentEnse, playlist) => ({ currentEnse, playlistLen: playlist.length })
);

export default connect<*, *, *, *, *, *>(
  selector,
  d => ({
    setPaused: p => d(setCurrentPaused(p)),
    seek: (sec: number) => d(seekCurrentRelative(sec * 1e3)),
    seekAbs: (ms: number) => d(seekCurrentTo(ms)),
    playNext: () => d(_playNext),
    playBack: () => d(_playBack),
  })
)(FullPlayerScreen);
