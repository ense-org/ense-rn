import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import DeviceKeySwitcher from 'screens/DeviceKeySwitcher';
import { Main } from 'navigation/keys';
import MainTabNavigator from './MainTabNavigator';

/**
 * This is the root app navigator, rendered directly by {@link App.js}
 */
export default createAppContainer(
  createSwitchNavigator(
    {
      DeviceKeySwitcher,
      [Main.tabs]: MainTabNavigator,
    },
    { initialRouteName: 'DeviceKeySwitcher' }
  )
);
