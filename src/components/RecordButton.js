// @flow
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import Colors from 'constants/Colors';
import { recordNew, recordStatus, stopRecording } from 'redux/ducks/run';
import type { RecordingStatus } from 'expo-av/build/Audio/Recording';

type DP = { recordNew: () => void, stopRecording: () => void };
type SP = { recordStatus: ?RecordingStatus };
type P = DP & SP;
const Btn = (p: P) => {
  const recording = get(p, 'recordStatus.isRecording');
  const onPress = recording ? p.stopRecording : p.recordNew;
  return (
    <Icon
      name={recording ? 'stop' : 'microphone'}
      type="font-awesome"
      size={24}
      reverse
      color={Colors.ense.pink}
      onPress={onPress}
    />
  );
};

const dispatch = d => ({
  recordNew: () => d(recordNew),
  stopRecording: () => d(stopRecording),
});
const selector = s => ({
  recordStatus: recordStatus(s),
});
export default connect<P, *, *, *, *, *>(
  selector,
  dispatch
)(Btn);
