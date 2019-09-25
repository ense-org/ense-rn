// @flow
import React from 'react';
import { get } from 'lodash';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import Colors from 'constants/Colors';
import { withNavigation } from 'react-navigation';
import { recordNew, recordStatus, finishRecording } from 'redux/ducks/run';
import { root } from 'navigation/keys';
import type { RecordingStatus } from 'expo-av/build/Audio/Recording';
import type { NP } from 'utils/types';

type DP = {| recordNew: () => void, finishRecording: () => void |};
type SP = {| recordStatus: ?RecordingStatus |};
type P = {| ...DP, ...SP, ...NP |};

const RecordButton = (p: P) => {
  const recording = get(p, 'recordStatus.isRecording', false);
  const paused = p.recordStatus && !p.recordStatus.isRecording;
  const wrappedStop = () => {
    p.finishRecording();
    p.navigation.navigate(root.postEnseModal.key);
  };
  const ready = recording || paused;
  const onPress = ready ? wrappedStop : p.recordNew;
  const name = ready ? 'stop' : 'logo';
  return (
    <View style={{ marginTop: -12 }}>
      <Icon
        raised
        name={name}
        type="enseicons"
        size={30}
        reverse
        color={Colors.ense.pink}
        onPress={onPress}
      />
    </View>
  );
};

const dispatch = d => ({
  recordNew: () => d(recordNew()),
  finishRecording: () => d(finishRecording),
});
const selector = s => ({
  recordStatus: recordStatus(s),
});
const Connected = connect<P, *, *, *, *, *>(
  selector,
  dispatch
)(RecordButton);

export default withNavigation(Connected);
