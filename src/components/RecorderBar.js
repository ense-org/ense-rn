// @flow
import React from 'react';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { StyleSheet, View, Text } from 'react-native';
import layout, { fontSize, halfPad, padding, small } from 'constants/Layout';
import Colors from 'constants/Colors';
import {
  cancelRecording,
  pauseRecording,
  recordStatus as selStatus,
  resumeRecording,
} from 'redux/ducks/run';
import { RecordingStatus } from 'expo-av/build/Audio/Recording';
import { toDurationStr } from 'utils/time';

type SP = {| recordStatus: ?RecordingStatus |};
type DP = {| pause: () => void, resume: () => void, cancel: () => void |};
type P = { ...SP, ...DP };

const progressHeight = 3;
const iconSize = 28;
const maxMillis = 5 * 60 * 1000;

const RecorderBar = (props: P) => {
  const { recordStatus } = props;
  if (!recordStatus) {
    return null;
  }
  const { isRecording, durationMillis, isDoneRecording } = recordStatus;
  const width =
    (isRecording && durationMillis ? (durationMillis / maxMillis) * layout.window.width : 0) || 0;
  const timeColor = { color: isRecording ? Colors.ense.pink : Colors.text.secondary };
  // eslint-disable-next-line no-nested-ternary
  const statusText = isDoneRecording ? 'publish' : isRecording ? 'listening...' : 'paused';
  return (
    <View style={styles.container}>
      <View style={styles.durationBack} />
      <View style={[styles.durationFront, { width }]} />
      <View style={styles.player}>
        <Icon
          size={iconSize}
          name={isRecording ? 'x' : 'redo'}
          type={isRecording ? 'feather' : 'evilicon'}
          iconStyle={styles.upBtn}
          color={Colors.gray['4']}
          // disabled={!isRecording}
          // onPress={props.cancel}
        />
        <View style={styles.enseInfo}>
          <Text numberOfLines={1} style={[styles.text, timeColor]}>
            {toDurationStr((durationMillis || 0) / 1000)}
          </Text>
          <View style={styles.nameContainer}>
            <Text numberOfLines={1} style={styles.handle}>
              {statusText}
            </Text>
          </View>
        </View>
        <Icon
          size={iconSize}
          name={isRecording ? 'pause-circle' : 'play-circle-outline'}
          type={isRecording ? 'feather' : 'material'}
          color={Colors.gray['4']}
          iconStyle={styles.playBtn}
          // onPress={isRecording ? props.pause : props.resume}
          // disabled={isDoneRecording}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'column' },
  player: { flexDirection: 'row', alignItems: 'center' },
  enseInfo: {
    flexDirection: 'column',
    paddingLeft: halfPad,
    paddingTop: halfPad,
    paddingBottom: padding,
    flex: 1,
  },
  durationBack: { height: progressHeight, backgroundColor: Colors.gray['0'] },
  durationFront: {
    marginTop: -progressHeight,
    height: progressHeight,
    backgroundColor: Colors.ense.pink,
    borderRadius: progressHeight / 2,
  },
  username: { fontSize: small, paddingRight: 5, color: Colors.ense.black, fontWeight: 'bold' },
  nameContainer: { flexDirection: 'row', justifyContent: 'center' },
  handle: { fontSize: small, textAlign: 'center' },
  text: {
    fontSize,
    color: Colors.gray['5'],
    marginBottom: halfPad,
    textAlign: 'center',
    fontFamily: 'Menlo-Bold',
  },
  playBtn: { padding: halfPad, paddingRight: padding },
  upBtn: { padding: halfPad, paddingLeft: padding },
  disabledButton: { backgroundColor: 'transparent' },
});

const select = (s): SP => ({ recordStatus: selStatus(s) });
const dispatch = (d): DP => ({
  pause: () => d(pauseRecording),
  resume: () => d(resumeRecording),
  cancel: () => d(cancelRecording),
});
export default connect<P, *, SP, DP, *, *>(
  select,
  dispatch
)(RecorderBar);
