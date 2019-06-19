// @flow
import { Platform } from 'react-native';
import { colors } from 'react-native-elements';
import { regular } from 'constants/Layout';
import Colors from 'constants/Colors';

export default {
  colors: {
    ...Platform.select({
      default: colors.platform.android,
      ios: colors.platform.ios,
    }),
  },
  Header: {
    leftComponent: { style: { fontSize: regular, color: Colors.headerTint } },
    rightComponent: { style: { fontSize: regular, color: Colors.headerTint } },
    centerComponent: { style: { fontWeight: 'bold', fontSize: regular } },
    backgroundColor: 'white',
  },
};
