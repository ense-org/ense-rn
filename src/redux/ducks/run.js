// @flow

import { createAction, createReducer, createSelector, PayloadAction } from 'redux-starter-kit';
import { get } from 'lodash';
import type { GetState, Dispatch } from 'redux/types';
import { Audio } from 'expo-av';
import Ense from 'models/Ense';
import type { PlaybackStatus, PlaybackStatusToSet } from 'expo-av/build/AV';
import { uuidv4 } from 'utils/strings';
import { asArray } from 'utils/other';

type AudioMode = 'record' | 'play';

export type QueuedEnse = {
  id: string,
  ense: Ense,
  playback: ?Audio.Sound,
  status: ?PlaybackStatus,
};
export type RunState = {
  playlist: QueuedEnse[],
  current: ?string,
  recording: ?Audio.Recording,
  audioMode: ?AudioMode,
};

const _pushQueuedEnse = createAction('run/enqueueQueuedEnse');
const _rawUpdateQueuedEnse = createAction('run/updateQueuedEnse');
const _rawSetQueue = createAction('run/replaceEnseQueue');
const _rawSetCurrent = createAction('run/setCurrent');
const _rawSetRecording = createAction('run/setRecording');
const _rawSetAudioMode = createAction('run/setAudioMode');

const defaultState: RunState = {
  playlist: [],
  current: null,
  recording: null,
  audioMode: null,
};

export const currentEnse = createSelector(
  ['run.current', 'run.playlist'],
  (id, list) => list.find(qe => qe.id === id)
);

export const currentlyPlaying = createSelector(
  ['run.current', 'run.playlist'],
  (id, list) => get(list.find(qe => qe.id === id && get(qe, 'status.isPlaying')), 'ense')
);

const _updateQueuedEnse = (id: string) => (partial: QueuedEnse) => (d: Dispatch, gs: GetState) => {
  const found = gs().run.playlist.find(lqe => lqe.id === id);
  found && d(_rawUpdateQueuedEnse({ ...found, ...partial }));
};

export const _makePlayer = (qe: QueuedEnse, partial?: ?PlaybackStatusToSet) => async (
  d: Dispatch,
  gs: GetState
) => {
  const initial = { ...gs().player.playbackStatus, ...qe.status, ...partial };
  const { sound, status } = await Audio.Sound.createAsync(
    { uri: qe.ense.fileUrl },
    initial,
    _updateQueuedEnse(qe.id)
  );
  const e = { ...qe, status, playback: sound };
  d(_rawUpdateQueuedEnse(e));
  return e;
};

const setAudioMode = (audioMode: ?AudioMode) => async (
  d: Dispatch,
  gs: GetState
): Promise<?AudioMode> => {
  d(_rawSetAudioMode(audioMode));
  if (!audioMode || get(gs(), 'run.audioMode') === audioMode) {
    return audioMode;
  }
  const stateKey = audioMode === 'play' ? 'audioModePlay' : 'audioModeRecord';
  const settings = gs().player[stateKey];
  await Audio.setAudioModeAsync(settings);
  return audioMode;
};

export const pushEnsePlayer = (ense: Ense) => (d: Dispatch, gs: GetState) => {
  const qe = { id: uuidv4(), ense, playback: null, status: null };
  d(_pushQueuedEnse(qe));
  return d(_makePlayer(qe, gs().player.playbackStatus));
};

export const playSingle = (ense: Ense, partial?: ?PlaybackStatusToSet) => async (
  d: Dispatch,
  gs: GetState
) => {
  const initialStatus = { ...gs().player.playbackStatus, shouldPlay: true, ...partial };
  const qe = { id: uuidv4(), ense, playback: null, status: initialStatus };
  await d(setNowPlaying(qe));
  await d(setAudioMode('play'));
  return d(_makePlayer(qe));
};

export const recordNew = async (d: Dispatch, gs: GetState) => {
  await d(setAudioMode('record'));
  await d(setNowPlaying([]));
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY);
  recording.setOnRecordingStatusUpdate(console.log);
  d(_rawSetRecording(recording));
  await recording.startAsync();
};

export const setStatus = (qe: QueuedEnse, status: PlaybackStatusToSet) => (d: Dispatch) => {
  const { playback } = qe;
  if (!playback) {
    console.warn('err no playback');
    // TODO think about what should happen here
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
  // TODO think about what should happen here
  if (!qe) {
    console.warn('err no current');
    return Promise.resolve(null);
  }
  return d(setStatus(qe, status));
};

const setNowPlaying = (qe: QueuedEnse | QueuedEnse[]) => async (d: Dispatch, gs: GetState) => {
  const unloads = _unloadPlayerTasks(gs);
  const q = asArray(qe);
  d(_rawSetQueue(q));
  d(_rawSetCurrent(get(q, [0, 'id'], null)));
  return Promise.all(unloads);
};

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

export const setPaused = (paused: boolean) => (d: Dispatch, gs: GetState) => {
  return d(setStatusOnCurrent({ shouldPlay: !paused }));
};

const _pushQueuedReducer = (s: RunState, a: PayloadAction<QueuedEnse>) => ({
  ...s,
  playlist: s.playlist.concat(a.payload),
});
const _setQueueReducer = (s: RunState, a: PayloadAction<QueuedEnse | QueuedEnse[]>) => ({
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
const _setAudioModeReducer = (s: RunState, a: PayloadAction<?AudioMode>) => ({
  ...s,
  audioMode: a.payload,
});

export const reducer = createReducer(defaultState, {
  [_pushQueuedEnse]: _pushQueuedReducer,
  [_rawUpdateQueuedEnse]: _updateQueuedReducer,
  [_rawSetQueue]: _setQueueReducer,
  [_rawSetCurrent]: _setCurrentReducer,
  [_rawSetRecording]: _setRecordingReducer,
  [_rawSetAudioMode]: _setAudioModeReducer,
});
