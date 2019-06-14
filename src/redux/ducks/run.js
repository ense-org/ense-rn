// @flow

import { createAction, createReducer, createSelector, PayloadAction } from 'redux-starter-kit';
import { get } from 'lodash';
import { Audio } from 'expo-av';
import Ense from 'models/Ense';
import type { PlaybackStatus, PlaybackSource, PlaybackStatusToSet } from 'expo-av/build/AV';
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

export const _getPlayer = (qe: QueuedEnse, overrideStatus?: ?PlaybackStatusToSet) => (d, gs) => {
  const initialStatus = { ...gs().player.playback, ...qe.status, ...overrideStatus };
  return Audio.Sound.createAsync({ uri: qe.ense.fileUrl }, initialStatus)
    .then(({ sound, status }) => {
      // TODO attach a update listener // manage it
      const e = { ...qe, status, playback: sound };
      d(_updateQueuedEnse(e));
      return e;
    })
    .catch(console.error);
};

export const pushEnsePlayer = (ense: Ense) => (d, gs) => {
  const qe = { id: uuidv4(), ense, playback: null, status: null };
  d(_pushQueuedEnse(qe));
  return d(_getPlayer(qe), gs().player.playback);
};

export const playSingle = (ense: Ense, extraSettings?: ?PlaybackStatusToSet) => (d, gs) => {
  const initialStatus = { ...gs().player.playback, shouldPlay: true, ...extraSettings };
  const qe = { id: uuidv4(), ense, playback: null, status: initialStatus };
  d(_replaceEnseQ(qe));
  d(_setCurrent(qe.id));
  return d(_getPlayer(qe));
};

export const setStatus = (qe: QueuedEnse, status: PlaybackStatusToSet) => (d, gs) => {
  const { playback } = qe;
  console.log('setstatus', status, qe, playback);
  if (!playback) {
    // TODO think about what should happen here
    return Promise.resolve(null);
  }
  return playback.setStatusAsync(status).then(newStatus => {
    const e = { ...qe, status: newStatus };
    d(_updateQueuedEnse(e));
    return e;
  });
};

export const setStatusOnCurrent = (status: PlaybackStatusToSet) => (d, gs) => {
  const qe = currentEnse(gs());
  // TODO think about what should happen here
  if (!qe) {
    return Promise.resolve(null);
  }
  return d(setStatus(qe, status));
};

export const setPaused = (paused: boolean) => (d, gs) => {
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
