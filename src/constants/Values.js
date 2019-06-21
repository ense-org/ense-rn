// @flow

import type { RecordingOptions } from 'expo-av/build/Audio/Recording';
import { Audio } from 'expo-av';

const {
  RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
  RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
  RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
  RECORDING_OPTION_IOS_AUDIO_QUALITY_LOW,
  RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
} = Audio;

export const emptyProfPicUrl = 'https://ense.nyc/Assets/ense_no_image.png';
export const anonName = 'Anonymous';

export const REC_OPTS: RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    outputFormat: RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
    audioQuality: RECORDING_OPTION_IOS_AUDIO_QUALITY_LOW,
    sampleRate: 16000,
    numberOfChannels: 2,
    bitRate: 64000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};
