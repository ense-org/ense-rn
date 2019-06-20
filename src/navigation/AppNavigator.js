import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import DeviceKeySwitcher from 'screens/DeviceKeySwitcher';
import { deviceKeySwitch, tabs } from 'navigation/keys';
import PostEnseScreen from 'screens/PostEnseScreen';
import EnseListensScreen from 'screens/EnseListensScreen';
import { stackNavigator } from 'navigation/helpers';

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
    Main: { screen: MainSwitch },
    PostEnse: { screen: PostEnseScreen },
    EnseListensScreen: { screen: EnseListensScreen },
  },
  { mode: 'modal', headerMode: 'none' }
);

/**
 * This is the root app navigator, rendered directly by {@link App.js}
 */
export default createAppContainer(RootStack);
