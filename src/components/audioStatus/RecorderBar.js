// @flow
import React from 'react';
import { get } from 'lodash';
import * as Animatable from 'react-native-animatable';
import { type IconProps } from 'react-native-elements';
import { createSelector } from 'redux-starter-kit';
import { connect } from 'react-redux';
import layout from 'constants/Layout';
import Colors from 'constants/Colors';
import {
  cancelRecording,
  finishRecording as _finishRec,
  pauseRecording,
  pauseRecordingPlayback as _pauseRecPlayback,
  playbackRecording as _playbackRec,
  recordNew as _recNew,
  resumeRecording,
} from 'redux/ducks/run';
import { RecordingStatus } from 'expo-av/build/Audio/Recording';
import { toDurationStr } from 'utils/time';
import { ifiOS } from 'utils/device';
import Ense from 'models/Ense';
import type { RecordAudio } from 'redux/ducks/run';

import StatusBar, { maxMillis } from './shared';

type BarState =
  | 'init'
  | 'recording'
  | 'redo'
  | 'recordingPaused'
  | 'done'
  | 'doneReplay'
  | 'doneReplayPaused'
  | 'deinit'
  | 'uploading';

type SP = {|
  recordStatus: ?RecordingStatus,
  uploading: boolean,
  eagerRecord: boolean,
  inReplyTo: ?Ense,
  recordAudio: ?RecordAudio,
|};
type DP = {|
  pause: () => void,
  resume: () => void,
  cancel: () => void,
  recordNew: (?Ense) => void,
  finishRecording: () => void,
  playbackRecording: () => void,
  pauseRecordingPlayback: () => void,
|};
type P = { ...SP, ...DP };
type S = {| redoing: boolean, replaying: boolean |};

const initRecordState = {
  canRecord: true,
  isRecording: false,
  isDoneRecording: false,
  durationMillis: 0,
};

class RecorderBar extends React.Component<P, S> {
  state = { redoing: false, replaying: false };

  _startRedo = async () => {
    const { cancel, recordNew, inReplyTo } = this.props;
    this.setState({ redoing: true });
    await cancel();
    recordNew(inReplyTo);
  };

  _finishRedo = () => {
    const { finishRecording } = this.props;
    finishRecording();
    this.setState({ redoing: false });
  };

  _leftIconProps = (state: BarState) => {
    const { cancel, uploading } = this.props;
    const redo = {
      name: 'rotate-ccw',
      type: 'feather',
      disabled: uploading,
      onPress: this._startRedo,
      size: 24,
    };
    const discard = { name: 'x', type: 'feather', disabled: uploading, onPress: cancel, size: 24 };
    const done = {
      name: 'stop',
      type: 'enseicons',
      disabled: uploading,
      onPress: this._finishRedo,
      size: 24,
      color: Colors.ense.pink,
    };
    return ({
      recording: discard,
      redo: done,
      recordingPaused: discard,
      done: redo,
      doneReplay: redo,
      doneReplayPaused: redo,
    }: { [BarState]: IconProps })[state];
  };

  _startReplay = () => {
    this.props.playbackRecording();
    this.setState({ replaying: true });
  };

  _resumeReplay = () => {
    this.props.playbackRecording();
  };

  _rightIconProps = (state: BarState) => {
    const { resume, pause, uploading, pauseRecordingPlayback } = this.props;
    return ({
      recording: { name: 'pause-circle', type: 'feather', disabled: false, onPress: pause },
      recordingPaused: {
        name: 'plus-circle',
        type: 'feather',
        disabled: uploading,
        onPress: resume,
        color: Colors.ense.pink,
      },
      done: {
        name: 'play-circle',
        type: 'feather',
        disabled: uploading,
        onPress: this._startReplay,
      },
      doneReplay: {
        name: 'pause-circle',
        type: 'feather',
        disabled: uploading,
        onPress: pauseRecordingPlayback,
      },
      doneReplayPaused: {
        name: 'play-circle',
        type: 'feather',
        disabled: uploading,
        onPress: this._resumeReplay,
      },
    }: { [BarState]: IconProps })[state];
  };

  _ensingTxt = (reDoing: boolean): string => {
    const { inReplyTo } = this.props;
    if (!inReplyTo) {
      return reDoing ? 're-recording...' : 'ensing...';
    }
    const handle = get(inReplyTo, 'userhandle');
    const to = handle ? ` @${handle}` : ` ${inReplyTo.nameFitted()}`;
    return `re-recording reply to ${to}...`;
  };

  _statusText = (state: BarState) =>
    ({
      init: '...',
      recording: this._ensingTxt(),
      redo: this._ensingTxt(true),
      recordingPaused: 'paused',
      done: 'ready to publish',
      doneReplay: 'replaying...',
      doneReplayPaused: 'replay paused',
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
    const { uploading, recordAudio } = this.props;
    const { redoing, replaying } = this.state;
    if (redoing) {
      return 'redo';
    }
    if (uploading) {
      return 'uploading';
    }
    const playbackStatus = get(recordAudio, 'status');
    if (replaying && playbackStatus) {
      const { isPlaying, positionMillis, durationMillis, didJustFinish } = playbackStatus;
      if (isPlaying) {
        return 'doneReplay';
      } else if (positionMillis < durationMillis) {
        return 'doneReplayPaused';
      } else if (didJustFinish) {
        this.setState({ replaying: false });
      }
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

  _progressWidth = (s: RecordingStatus) => {
    const { recordAudio } = this.props;
    const replay = get(recordAudio, 'status');
    const dur = get(replay, 'durationMillis');
    if (this.state.replaying && dur) {
      return ((replay.positionMillis || 0) / dur) * layout.window.width;
    }
    return s.isDoneRecording ? 0 : ((s.durationMillis || 0) / maxMillis) * layout.window.width;
  };

  _duration = (s: RecordingStatus) => {
    const { recordAudio } = this.props;
    const replayStatus = get(recordAudio, 'status');
    if (this.state.replaying && replayStatus) {
      return toDurationStr((replayStatus.positionMillis || 0) / 1000);
    }
    return toDurationStr((s.durationMillis || 0) / 1000);
  };

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
          topTextStyle={{
            fontFamily: ifiOS('Menlo-Bold', 'monospace'),
            color: this._statusClr(bs),
          }}
        />
      </Animatable.View>
    );
  }
}

const select = createSelector(
  ['run.recordStatus', 'run.uploading', 'run.eagerRecord', 'run.inReplyTo', 'run.recordAudio'],
  (recordStatus, uploading, eagerRecord, inReplyTo, recordAudio) => ({
    recordStatus,
    uploading,
    eagerRecord,
    inReplyTo,
    recordAudio,
  })
);
// const select = (s): SP => ({ recordStatus: selStatus(s) });
const dispatch = (d): DP => ({
  pause: () => d(pauseRecording),
  resume: () => d(resumeRecording),
  cancel: () => d(cancelRecording),
  recordNew: inReplyTo => d(_recNew(inReplyTo)),
  finishRecording: () => d(_finishRec),
  playbackRecording: () => d(_playbackRec),
  pauseRecordingPlayback: () => d(_pauseRecPlayback),
});
export default connect<P, *, SP, DP, *, *>(
  select,
  dispatch
)(RecorderBar);
