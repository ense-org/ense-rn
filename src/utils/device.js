// @flow
import { Platform } from 'react-native';

export const ifiOS = <T>(v: T, elseV: T): T => (Platform.OS === 'ios' ? v : elseV);
export const isIOS = Platform.OS === 'ios';
