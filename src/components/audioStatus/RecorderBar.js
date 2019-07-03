// @flow
import React from 'react';
import * as Animatable from 'react-native-animatable';
import { type IconProps } from 'react-native-elements';
import { createSelector } from 'redux-starter-kit';
import { connect } from 'react-redux';
import layout from 'constants/Layout';
import Colors from 'constants/Colors';
import { cancelRecording, pauseRecording, recordNew, resumeRecording } from 'redux/ducks/run';
import { RecordingStatus } from 'expo-av/build/Audio/Recording';
import { toDurationStr } from 'utils/time';

import StatusBar, { maxMillis } from './shared';

type BarState =
  | 'init'
  | 'recording'
  | 'recordingPaused'
  | 'done'
  | 'doneReplay'
  | 'doneReplayPaused'
  | 'deinit'
  | 'uploading';

type SP = {| recordStatus: ?RecordingStatus, uploading: boolean, eagerRecord: boolean |};
type DP = {| pause: () => void, resume: () => void, cancel: () => void, reRecord: () => void |};
type P = { ...SP, ...DP };

const initRecordState = {
  canRecord: true,
  isRecording: false,
  isDoneRecording: false,
  durationMillis: 0,
};

class RecorderBar extends React.Component<P> {
  _leftIconProps = (state: BarState) => {
    const { cancel, reRecord, uploading } = this.props;
    const redo = {
      name: 'rotate-ccw',
      type: 'feather',
      disabled: uploading,
      onPress: reRecord,
      size: 24,
    };
    const discard = { name: 'x', type: 'feather', disabled: uploading, onPress: cancel, size: 24 };
    return ({
      recording: discard,
      recordingPaused: discard,
      done: redo,
      doneReplay: redo,
      doneReplayPaused: redo,
    }: { [BarState]: IconProps })[state];
  };

  _rightIconProps = (state: BarState) => {
    const { resume, pause, uploading } = this.props;
    return ({
      recording: { name: 'pause-circle', type: 'feather', disabled: false, onPress: pause },
      recordingPaused: {
        name: 'plus-circle',
        type: 'feather',
        disabled: uploading,
        onPress: resume,
        color: Colors.ense.pink,
      },
      done: { name: 'play-circle', type: 'feather', disabled: uploading, onPress: null },
      doneReplay: { name: 'pause-circle', type: 'feather', disabled: uploading, onPress: null },
      doneReplayPaused: {
        name: 'play-circle',
        type: 'feather',
        disabled: uploading,
        onPress: null,
      },
    }: { [BarState]: IconProps })[state];
  };

  _statusText = (state: BarState) =>
    ({
      init: '...',
      recording: 'listening...',
      recordingPaused: 'paused',
      done: 'publish',
      doneReplay: 'playing...',
      doneReplayPaused: 'paused',
      deinit: '...',
      uploading: 'uploading...',
    }: { [BarState]: string })[state];

  _statusClr = (state: BarState) =>
    ({
      init: Colors.gray['3'],
      recording: Colors.ense.pink,
      recordingPaused: Colors.gray['3'],
      done: Colors.gray['5'],
      doneReplay: Colors.ense.pink,
      doneReplayPaused: Colors.gray['3'],
      deinit: Colors.gray['3'],
      uploading: Colors.ense.pink,
    }[state]);

  _barState = (status: RecordingStatus): BarState => {
    if (this.props.uploading) {
      return 'uploading';
    }
    const { isRecording, isDoneRecording, durationMillis, canRecord } = status;
    if (!canRecord && !isDoneRecording) {
      return 'deinit';
    } else if (isRecording) {
      return 'recording';
    } else {
      if (durationMillis === 0) {
        return 'init';
      }
      return isDoneRecording ? 'done' : 'recordingPaused';
    }
  };

  _progressWidth = (s: RecordingStatus) =>
    s.isDoneRecording ? 0 : ((s.durationMillis || 0) / maxMillis) * layout.window.width;

  _duration = (s: RecordingStatus) => toDurationStr((s.durationMillis || 0) / 1000);

  render() {
    const { recordStatus, eagerRecord } = this.props;
    if (!recordStatus && !eagerRecord) {
      return null;
    }
    const rs = recordStatus || initRecordState;
    const bs = this._barState(rs);
    return (
      <Animatable.View animation="slideInUp" duration={185} useNativeDriver>
        <StatusBar
          durationWidth={this._progressWidth(rs)}
          leftIconProps={this._leftIconProps(bs)}
          rightIconProps={this._rightIconProps(bs)}
          mainContent={this._duration(rs)}
          subContent={this._statusText(bs)}
          topTextStyle={{ fontFamily: 'Menlo-Bold', color: this._statusClr(bs) }}
        />
      </Animatable.View>
    );
  }
}

const select = createSelector(
  ['run.recordStatus', 'run.uploading', 'run.eagerRecord'],
  (recordStatus, uploading, eagerRecord) => ({ recordStatus, uploading, eagerRecord })
);
// const select = (s): SP => ({ recordStatus: selStatus(s) });
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
