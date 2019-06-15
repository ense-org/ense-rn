// @flow
import React from 'react';
import { get } from 'lodash';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import Colors from 'constants/Colors';
import { withNavigation } from 'react-navigation';
import { recordNew, recordStatus, stopRecording } from 'redux/ducks/run';
import { root } from 'navigation/keys';
import type { RecordingStatus } from 'expo-av/build/Audio/Recording';
import type { NP } from 'utils/types';

type DP = { recordNew: () => void, stopRecording: () => void };
type SP = { recordStatus: ?RecordingStatus };
type P = DP & SP & NP;
const Btn = (p: P) => {
  const recording = get(p, 'recordStatus.isRecording');
  const wrappedStop = () => {
    p.stopRecording();
    p.navigation.navigate(root.postEnseModal.key);
  };
  const onPress = recording ? wrappedStop : p.recordNew;
  return (
    <View style={{ marginTop: -16 }}>
      <Icon
        name={recording ? 'stop' : 'microphone'}
        type="font-awesome"
        size={32}
        reverse
        color={Colors.ense.pink}
        onPress={onPress}
      />
    </View>
  );
};

const dispatch = d => ({
  recordNew: () => d(recordNew),
  stopRecording: () => d(stopRecording),
});
const selector = s => ({
  recordStatus: recordStatus(s),
});
const Connected = connect<P, *, *, *, *, *>(
  selector,
  dispatch
)(Btn);

export default withNavigation(Connected);
