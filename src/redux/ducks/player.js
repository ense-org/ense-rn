// @flow

import { createAction, createReducer, createSelector } from 'redux-starter-kit';
import { Audio } from 'expo-av';
import Ense from 'models/Ense';

export const updateEnse = createAction('player/updateEnse');

export type AudioMode = {
  allowsRecordingIOS: boolean,
  interruptionModeIOS: number,
  playsInSilentModeIOS: boolean,
  staysActiveInBackground: boolean,
  interruptionModeAndroid: number,
  shouldDuckAndroid: boolean,
  playThroughEarpieceAndroid: boolean,
};

export type PlayerState = {
  audioMode: AudioMode,
  playback: {
    playbackInstancePosition: ?number,
    playbackInstanceDuration: ?number,
    isPlaying: boolean,
    isBuffering: boolean,
    shouldCorrectPitch: boolean,
    rate: number,
    throughEarpiece: boolean,
  },
  ense: ?Ense,
};

const defaultState: PlayerState = {
  audioMode: {
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    playThroughEarpieceAndroid: false,
  },
  playback: {
    playbackInstancePosition: null,
    playbackInstanceDuration: null,
    isPlaying: false,
    isBuffering: false,
    shouldCorrectPitch: true,
    rate: 1.0,
    throughEarpiece: false,
  },
  ense: null,
};

export const enseSelector = createSelector(
  ['player.ense'],
  t => t && Ense.parse(t)
);

export const reducer = createReducer(defaultState, {
  [updateEnse]: (s, a) => ({ ...s, ense: a.payload.toJSON() }),
});
