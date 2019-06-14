// @flow

import { createAction, createReducer, createSelector, PayloadAction } from 'redux-starter-kit';
import { get } from 'lodash';
import type { GetState, Dispatch } from 'redux/types';
import { Audio } from 'expo-av';
import Ense from 'models/Ense';
import type { PlaybackStatus, PlaybackStatusToSet } from 'expo-av/build/AV';
import { uuidv4 } from 'utils/strings';
import { asArray } from 'utils/other';

export type QueuedEnse = {
  id: string,
  ense: Ense,
  playback: ?Audio.Sound,
  status: ?PlaybackStatus,
};
export type RunState = {
  playlist: QueuedEnse[],
  current: ?string,
};

const _pushQueuedEnse = createAction('run/enqueueQueuedEnse');
const _replaceEnseQ = createAction('run/replaceEnseQueue');
const _updateQueuedEnse = createAction('run/updateQueuedEnse');
const _setCurrent = createAction('run/setCurrent');

const defaultState: RunState = {
  playlist: [],
  current: null,
};

export const currentEnse = createSelector(
  ['run.current', 'run.playlist'],
  (id, list) => list.find(qe => qe.id === id)
);

export const currentlyPlaying = createSelector(
  ['run.current', 'run.playlist'],
  (id, list) => get(list.find(qe => qe.id === id && get(qe, 'status.isPlaying')), 'ense')
);

export const _getPlayer = (qe: QueuedEnse, overrideStatus?: ?PlaybackStatusToSet) => (
  d: Dispatch,
  gs: GetState
) => {
  const initialStatus = { ...gs().player.playbackStatus, ...qe.status, ...overrideStatus };
  return Audio.Sound.createAsync({ uri: qe.ense.fileUrl }, initialStatus, status => {
    const found = gs().run.playlist.find(lqe => lqe.id === qe.id);
    found && d(_updateQueuedEnse({ ...found, status }));
  })
    .then(({ sound, status }) => {
      const e = { ...qe, status, playback: sound };
      d(_updateQueuedEnse(e));
      return e;
    })
    .catch(console.error);
};

export const pushEnsePlayer = (ense: Ense) => (d: Dispatch, gs: GetState) => {
  const qe = { id: uuidv4(), ense, playback: null, status: null };
  d(_pushQueuedEnse(qe));
  return d(_getPlayer(qe, gs().player.playbackStatus));
};

export const playSingle = (ense: Ense, extraSettings?: ?PlaybackStatusToSet) => (
  d: Dispatch,
  gs: GetState
) => {
  const initialStatus = { ...gs().player.playbackStatus, shouldPlay: true, ...extraSettings };
  const qe = { id: uuidv4(), ense, playback: null, status: initialStatus };
  const unloads = _unloadPromises(gs);
  d(_replaceEnseQ(qe));
  d(_setCurrent(qe.id));
  return Promise.all(unloads).then(() => d(_getPlayer(qe)));
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
    d(_updateQueuedEnse(e));
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

const _unloadAll = (d: Dispatch, gs: GetState) => Promise.all(_unloadPromises(gs));

const _unloadPromises = (gs: GetState) =>
  gs()
    .run.playlist.filter(pqe => pqe.playback)
    // $FlowIgnore - filtered already
    .map(pqe => pqe.playback.unloadAsync());

export const setPaused = (paused: boolean) => (d: Dispatch, gs: GetState) => {
  return d(setStatusOnCurrent({ shouldPlay: !paused }));
};

const _enqueue = (s: RunState, a: PayloadAction<QueuedEnse>) => ({
  ...s,
  playlist: s.playlist.concat(a.payload),
});
const _replace = (s: RunState, a: PayloadAction<QueuedEnse | QueuedEnse[]>) => ({
  ...s,
  playlist: asArray(a.payload),
});
const _update = (s: RunState, a: PayloadAction<QueuedEnse>) => ({
  ...s,
  playlist: s.playlist.map(qe => (qe.id === a.payload.id ? a.payload : qe)),
});
const _setCurrentR = (s: RunState, a: PayloadAction<?QueuedEnse>) => ({
  ...s,
  current: a.payload,
});

export const reducer = createReducer(defaultState, {
  [_pushQueuedEnse]: _enqueue,
  [_updateQueuedEnse]: _update,
  [_replaceEnseQ]: _replace,
  [_setCurrent]: _setCurrentR,
});
