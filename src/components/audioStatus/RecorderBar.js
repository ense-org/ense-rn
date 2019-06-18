// @flow
import React from 'react';
import { type IconProps } from 'react-native-elements';
import { connect } from 'react-redux';
import layout from 'constants/Layout';
import Colors from 'constants/Colors';
import {
  cancelRecording,
  pauseRecording,
  recordNew,
  recordStatus as selStatus,
  resumeRecording,
} from 'redux/ducks/run';
import { RecordingStatus } from 'expo-av/build/Audio/Recording';
import { toDurationStr } from 'utils/time';

import StatusBar, { maxMillis } from './shared';

type BarState = 'recording' | 'recordingPaused' | 'done' | 'doneReplay' | 'doneReplayPaused';

type SP = {| recordStatus: ?RecordingStatus |};
type DP = {| pause: () => void, resume: () => void, cancel: () => void, reRecord: () => void |};
type P = { ...SP, ...DP };

class RecorderBar extends React.Component<P> {
  _leftIconProps = (state: BarState) => {
    const { cancel, reRecord } = this.props;
    return ({
      recording: { name: 'x', type: 'feather', disabled: false, onPress: cancel },
      recordingPaused: { name: 'x', type: 'feather', disabled: false, onPress: cancel },
      done: { name: 'rotate-cw', type: 'feather', disabled: false, onPress: reRecord },
      doneReplay: { name: 'rotate-cw', type: 'feather', disabled: false, onPress: reRecord },
      doneReplayPaused: { name: 'rotate-cw', type: 'feather', disabled: false, onPress: reRecord },
    }: { [BarState]: IconProps })[state];
  };

  _rightIconProps = (state: BarState) => {
    const { resume, pause } = this.props;
    return ({
      recording: { name: 'pause-circle', type: 'feather', disabled: false, onPress: pause },
      recordingPaused: {
        name: 'plus-circle',
        type: 'feather',
        disabled: false,
        onPress: resume,
        color: Colors.ense.pink,
      },
      done: { name: 'play-circle', type: 'feather', disabled: false, onPress: null },
      doneReplay: { name: 'pause-circle', type: 'feather', disabled: false, onPress: null },
      doneReplayPaused: { name: 'play-circle', type: 'feather', disabled: false, onPress: null },
    }: { [BarState]: IconProps })[state];
  };

  _statusText = (state: BarState) =>
    ({
      recording: 'listening...',
      recordingPaused: 'paused',
      done: 'publish',
      doneReplay: 'playing...',
      doneReplayPaused: 'paused',
    }: { [BarState]: string })[state];

  _statusClr = (state: BarState) =>
    ({
      recording: Colors.ense.pink,
      recordingPaused: Colors.gray['3'],
      done: Colors.gray['3'],
      doneReplay: Colors.ense.pink,
      doneReplayPaused: Colors.gray['3'],
    }: { [BarState]: string })[state];

  _barState = (status: RecordingStatus): BarState => {
    const { isRecording, isDoneRecording } = status;
    if (isRecording) {
      return 'recording';
    } else {
      return isDoneRecording ? 'done' : 'recordingPaused';
    }
  };

  _progressWidth = (s: RecordingStatus): number =>
    s.isRecording ? ((s.durationMillis || 0) / maxMillis) * layout.window.width : 0;

  _duration = (s: RecordingStatus) => toDurationStr((s.durationMillis || 0) / 1000);

  render() {
    const { recordStatus } = this.props;
    if (!recordStatus) {
      return null;
    }
    const bs = this._barState(recordStatus);
    return (
      <StatusBar
        durationWidth={this._progressWidth(recordStatus)}
        leftIconProps={this._leftIconProps(bs)}
        rightIconProps={this._rightIconProps(bs)}
        mainContent={this._duration(recordStatus)}
        subContent={this._statusText(bs)}
        topTextStyle={{ color: this._statusClr(recordStatus), fontFamily: 'Menlo-Bold' }}
      />
    );
  }
}

const select = (s): SP => ({ recordStatus: selStatus(s) });
const dispatch = (d): DP => ({
  pause: () => d(pauseRecording),
  resume: () => d(resumeRecording),
  cancel: () => d(cancelRecording),
  reRecord: () => d(recordNew),
});
export default connect<P, *, SP, DP, *, *>(
  select,
  dispatch
)(RecorderBar);
