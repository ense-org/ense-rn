// @flow

import { createAction, createReducer, createSelector, PayloadAction } from 'redux-starter-kit';
import { get } from 'lodash';
import type { Dispatch, GetState } from 'redux/types';
import * as Permissions from 'expo-permissions';
import { Audio, Sound } from 'expo-av';
import Ense from 'models/Ense';
import { defaultState as defAudio } from 'redux/ducks/audio';
import type { PlaybackStatus, PlaybackStatusToSet } from 'expo-av/build/AV';
import type { RecordingStatus } from 'expo-av/build/Audio/Recording';
import { uuidv4 } from 'utils/strings';
import { asArray } from 'utils/other';
import { REC_OPTS } from 'constants/Values';
import uploadRecording from 'utils/api/uploadRecording';
import type { ArrayOrSingle } from 'utils/other';

type AudioMode = 'record' | 'play';
export type QueuedEnse = { id: string, ense: Ense, playback: ?Sound, status: ?PlaybackStatus };
export type RunState = {
  playlist: QueuedEnse[],
  current: ?string,
  audioMode: ?AudioMode,
  recording: ?Audio.Recording,
  recordStatus: RecordingStatus,
  recordAudio: ?{ sound: Audio.Sound, status: PlaybackStatus, recording: Audio.Recording },
  uploading: boolean,
};
export type PublishInfo = { title: string, unlisted: boolean };

const defaultState: RunState = {
  playlist: [],
  current: null,
  recording: null,
  audioMode: null,
  recordStatus: null,
  recordAudio: null,
  uploading: false,
};

/**
 * ************************************************************
 *                         ACTIONS
 * ************************************************************
 */

const _pushQueuedEnse = createAction('run/enqueueQueuedEnse');
const _rawUpdateQueuedEnse = createAction('run/updateQueuedEnse');
const _rawSetQueue = createAction('run/replaceEnseQueue');
const _rawSetCurrent = createAction('run/setCurrent');
const _rawSetRecording = createAction('run/setRecording');
const _rawSetRecordStatus = createAction('run/setRecordStatus');
const _rawSetRecordAudio = createAction('run/setRecordAudio');
const _rawSetAudioMode = createAction('run/setAudioMode');
const _rawSetUploading = createAction('run/setUploading');
export const publishEnse = (info: PublishInfo) => async (d: Dispatch, gs: GetState) => {
  const { recordAudio } = gs().run;
  if (!recordAudio) {
    throw new Error('no local recording');
  }
  d(_rawSetUploading(true));
  const r = await uploadRecording(recordAudio.recording, info);
  d(_rawSetUploading(false));
  return r;
};

/**
 * ************************************************************
 *                         SELECTORS
 * ************************************************************
 */

export const currentEnse = createSelector(
  ['run.current', 'run.playlist'],
  (id, list) => list.find(qe => qe.id === id)
);

export const recordStatus = createSelector(
  ['run.recordStatus'],
  s => s
);

export const currentlyPlaying = createSelector(
  ['run.current', 'run.playlist'],
  (id, list) => get(list.find(qe => qe.id === id && get(qe, 'status.isPlaying')), 'ense')
);

/**
 * ************************************************************
 *                      AUDIO GENERAL
 * ************************************************************
 */

const setAudioMode = (audioMode: ?AudioMode) => async (
  d: Dispatch,
  gs: GetState
): Promise<?AudioMode> => {
  if (!audioMode || get(gs(), 'run.audioMode') === audioMode) {
    d(_rawSetAudioMode(audioMode));
    return audioMode;
  }
  const stateKey = audioMode === 'play' ? 'audioModePlay' : 'audioModeRecord';
  const settings = gs().audio[stateKey];
  await Audio.setAudioModeAsync(settings);
  d(_rawSetAudioMode(audioMode));
  return audioMode;
};

/**
 * ************************************************************
 *                          PLAYBACK
 * ************************************************************
 */

export const queueEnse = (ense: Ense) => (d: Dispatch, gs: GetState) => {
  const qe = { id: uuidv4(), ense, playback: null, status: null };
  d(_pushQueuedEnse(qe));
  return d(_makePlayer(qe, gs().audio.playbackStatus));
};

export const playSingle = (ense: Ense, partial?: ?PlaybackStatusToSet) => async (
  d: Dispatch,
  gs: GetState
) => {
  const initialStatus = { ...gs().audio.playbackStatus, shouldPlay: true, ...partial };
  const qe = { id: uuidv4(), ense, playback: null, status: initialStatus };
  await d(setNowPlaying(qe));
  await d(setAudioMode('play'));
  return d(_makePlayer(qe));
};

export const recordNew = async (d: Dispatch) => {
  const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
  if (status !== 'granted') {
    return null; // TODO
  }
  await d(cancelRecording);
  await d(setAudioMode('record'));
  await d(setNowPlaying([]));
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(REC_OPTS);
  recording.setOnRecordingStatusUpdate(s => d(_rawSetRecordStatus(s)));
  d(_rawSetRecording(recording));
  await recording.startAsync();
  return recording;
};

export const setStatus = (qe: QueuedEnse, status: PlaybackStatusToSet) => (d: Dispatch) => {
  const { playback } = qe;
  if (!playback) {
    console.warn('err no playback'); // TODO consider what should happen here
    return Promise.resolve(null);
  }
  return playback.setStatusAsync(status).then(newStatus => {
    const e = { ...qe, status: newStatus };
    d(_rawUpdateQueuedEnse(e));
    return e;
  });
};

export const setStatusOnCurrent = (status: PlaybackStatusToSet) => (d: Dispatch, gs: GetState) => {
  const qe = currentEnse(gs());
  if (!qe) {
    console.warn('err no current'); // TODO consider what should happen here
    return Promise.resolve(null);
  }
  return d(setStatus(qe, status));
};

const setNowPlaying = (qe: ArrayOrSingle<QueuedEnse>) => async (d: Dispatch, gs: GetState) => {
  const unloads = _unloadPlayerTasks(gs);
  const q = asArray(qe);
  d(_rawSetQueue(q));
  d(_rawSetCurrent(get(q, [0, 'id'], null)));
  return Promise.all(unloads);
};

export const setCurrentPaused = (paused: boolean) => (d: Dispatch, gs: GetState) => {
  const qe = currentEnse(gs());
  if (!qe) {
    return Promise.resolve(null);
  }
  const pos = get(qe, 'status.positionMillis');
  const replay = !paused && qe.playback && pos && pos === get(qe, 'status.durationMillis');
  // This is a small optimization -- replayAsync on iOS can play immediately
  return replay ? qe.playback.replayAsync() : d(setStatus(qe, { shouldPlay: !paused }));
};

/**
 * ************************************************************
 *                          PLAYBACK
 * ************************************************************
 */

export const finishRecording = async (d: Dispatch, gs: GetState) => {
  const recording = await d(_unloadRecording);
  const { sound, status } = await recording.createNewLoadedSoundAsync(
    defAudio.playbackStatus,
    s => {
      const ra = gs().run.recordAudio;
      d(_rawSetRecordAudio(ra ? { ...ra, status: s } : null));
    }
  );
  const recordAudio = { sound, status, recording };
  d(_rawSetRecordAudio(recordAudio));
  d(setAudioMode('play')); // Should this be awaited?
  return recordAudio;
};

export const cancelRecording = async (d: Dispatch) => {
  await d(_unloadRecording);
  d(_rawSetRecordStatus(null));
  d(_rawSetRecordAudio(null));
};

export const pauseRecording = async (d: Dispatch, gs: GetState) => {
  const recording = get(gs().run, 'recording');
  if (!recording) {
    return;
  }
  try {
    await recording.pauseAsync();
  } catch (error) {
    console.warn('pause error', error);
  }
};

export const resumeRecording = async (d: Dispatch, gs: GetState) => {
  const recording = get(gs().run, 'recording');
  if (!recording) {
    console.warn('no recording to resume');
    return;
  }
  try {
    await recording.startAsync();
  } catch (error) {
    console.warn('pause error', error);
  }
};

/**
 * ************************************************************
 *                          PRIVATE
 * ************************************************************
 */

const _unloadAllPlayers = (d: Dispatch, gs: GetState) => Promise.all(_unloadPlayerTasks(gs));

const _unloadPlayerTasks = (gs: GetState): Promise<any>[] =>
  gs()
    .run.playlist.filter(pqe => pqe.playback)
    .map(async pqe => {
      const pb: Audio.Sound = pqe.playback;
      await pb.unloadAsync();
      pb.setOnPlaybackStatusUpdate(null);
      return pqe;
    });

const _updateQueuedEnse = (id: string, partial: $Shape<QueuedEnse>) => (
  d: Dispatch,
  gs: GetState
) => {
  const found = gs().run.playlist.find(lqe => lqe.id === id);
  found && d(_rawUpdateQueuedEnse({ ...found, ...partial }));
};

export const _makePlayer = (qe: QueuedEnse, partial?: ?PlaybackStatusToSet) => async (
  d: Dispatch,
  gs: GetState
) => {
  const initial = { ...gs().audio.playbackStatus, ...qe.status, ...partial };
  const { sound, status } = await Audio.Sound.createAsync({ uri: qe.ense.fileUrl }, initial, s =>
    d(_updateQueuedEnse(qe.id, { status: s }))
  );
  const e = { ...qe, status, playback: sound };
  d(_rawUpdateQueuedEnse(e));
  return e;
};

const _unloadRecording = async (d: Dispatch, gs: GetState) => {
  const recording = get(gs().run, 'recording');
  if (!recording) {
    return null;
  }
  try {
    await recording.stopAndUnloadAsync();
  } catch (error) {
    console.warn('already unloaded recorder', error);
  }
  recording.setOnRecordingStatusUpdate(null);
  d(_rawSetRecording(null));
  return recording;
};

const _pushQueuedReducer = (s: RunState, a: PayloadAction<QueuedEnse>) => ({
  ...s,
  playlist: s.playlist.concat(a.payload),
});
const _setQueueReducer = (s: RunState, a: PayloadAction<ArrayOrSingle<QueuedEnse>>) => ({
  ...s,
  playlist: asArray(a.payload),
});
const _updateQueuedReducer = (s: RunState, a: PayloadAction<QueuedEnse>) => ({
  ...s,
  playlist: s.playlist.map(qe => (qe.id === a.payload.id ? a.payload : qe)),
});
const _setCurrentReducer = (s: RunState, a: PayloadAction<?QueuedEnse>) => ({
  ...s,
  current: a.payload,
});
const _setRecordingReducer = (s: RunState, a: PayloadAction<?Audio.Recording>) => ({
  ...s,
  recording: a.payload,
});
const _setRecordAudioReducer = (s: RunState, a: PayloadAction<?RecordingStatus>) => ({
  ...s,
  recordAudio: a.payload,
});
const _setRecordStatusReducer = (s: RunState, a: PayloadAction<?RecordingStatus>) => ({
  ...s,
  recordStatus: a.payload,
});
const _setAudioModeReducer = (s: RunState, a: PayloadAction<?AudioMode>) => ({
  ...s,
  audioMode: a.payload,
});
const _setUploadingReducer = (s: RunState, a: PayloadAction<boolean>) => ({
  ...s,
  uploading: a.payload,
});

export const reducer = createReducer(defaultState, {
  [_pushQueuedEnse]: _pushQueuedReducer,
  [_rawUpdateQueuedEnse]: _updateQueuedReducer,
  [_rawSetQueue]: _setQueueReducer,
  [_rawSetCurrent]: _setCurrentReducer,
  [_rawSetRecording]: _setRecordingReducer,
  [_rawSetRecordStatus]: _setRecordStatusReducer,
  [_rawSetRecordAudio]: _setRecordAudioReducer,
  [_rawSetAudioMode]: _setAudioModeReducer,
  [_rawSetUploading]: _setUploadingReducer,
});
