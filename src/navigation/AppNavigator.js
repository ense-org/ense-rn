import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import DeviceKeySwitcher from 'screens/DeviceKeySwitcher';
import { deviceKeySwitch, tabs, root } from 'navigation/keys';
import PostEnseScreen from 'screens/PostEnseScreen';
import { stackNavigator } from 'navigation/helpers';
import Colors from 'constants/Colors';

import MainTabNavigator from './MainTabNavigator';

const MainSwitch = createSwitchNavigator(
  {
    [deviceKeySwitch.key]: DeviceKeySwitcher,
    [tabs.key]: MainTabNavigator,
  },
  { initialRouteName: deviceKeySwitch.key }
);

const RootStack = stackNavigator(
  {
    [root.main.key]: { screen: MainSwitch },
    [root.postEnseModal.key]: { screen: PostEnseScreen },
  },
  {
    mode: 'modal',
    headerMode: 'none',
    cardStyle: { opacity: 1, backgroundColor: Colors.gray['0'] },
  }
);

/**
 * This is the root app navigator, rendered directly by {@link App.js}
 */
export default createAppContainer(RootStack);
