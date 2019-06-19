// @flow
import { Platform } from 'react-native';
import { colors } from 'react-native-elements';
import { regular } from 'constants/Layout';

export default {
  colors: {
    ...Platform.select({
      default: colors.platform.android,
      ios: colors.platform.ios,
    }),
  },
  Header: {
    centerComponent: { style: { fontWeight: 'bold', fontSize: regular } },
    backgroundColor: 'white',
  },
};
