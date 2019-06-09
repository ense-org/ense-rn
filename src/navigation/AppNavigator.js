import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import DeviceKeySwitcher from 'screens/DeviceKeySwitcher';
import MainTabNavigator from './MainTabNavigator';
import ProfileStack from './stacks/ProfileStack';
import navigators from './index';

/**
 * This is the root app navigator, rendered directly by {@link App.js}
 */
export default createAppContainer(
  createSwitchNavigator(
    {
      DeviceKeySwitcher,
      [navigators.auth]: ProfileStack,
      [navigators.tabs]: MainTabNavigator,
    },
    { initialRouteName: 'DeviceKeySwitcher' }
  )
);
