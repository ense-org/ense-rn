// @flow

import { createAction, createReducer, createSelector } from 'redux-starter-kit';
import {
  INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
  INTERRUPTION_MODE_IOS_DO_NOT_MIX,
} from 'expo-av/build/Audio';
import Ense from 'models/Ense';

export const setRecent = createAction('audio/setMostRecent');

export type AudioMode = {
  allowsRecordingIOS: boolean,
  interruptionModeIOS: number,
  playsInSilentModeIOS: boolean,
  staysActiveInBackground: boolean,
  interruptionModeAndroid: number,
  shouldDuckAndroid: boolean,
  playThroughEarpieceAndroid: boolean,
};

export type AudioState = {
  audioModePlay: AudioMode,
  audioModeRecord: AudioMode,
  playbackStatus: {
    progressUpdateIntervalMillis: number,
    positionMillis: number,
    shouldPlay: boolean,
    rate: number,
    shouldCorrectPitch: boolean,
    volume: number,
    isMuted: boolean,
    isLooping: boolean,
  },
  mostRecent: ?Ense,
};

export const defaultState: AudioState = {
  audioModePlay: {
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    interruptionModeIOS: INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    playThroughEarpieceAndroid: false,
  },
  audioModeRecord: {
    allowsRecordingIOS: true,
    staysActiveInBackground: true,
    interruptionModeIOS: INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    playThroughEarpieceAndroid: false,
  },
  playbackStatus: {
    progressUpdateIntervalMillis: 500,
    positionMillis: 0,
    shouldPlay: false,
    rate: 1.0,
    shouldCorrectPitch: false,
    volume: 1.0,
    isMuted: false,
    isLooping: false,
  },
  mostRecent: null,
};

export const enseSelector = createSelector(
  ['audio.mostRecent'],
  t => t && Ense.parse(t)
);

export const reducer = createReducer(defaultState, {
  [setRecent]: (s, a) => ({ ...s, mostRecent: a.payload.toJSON() }),
});
