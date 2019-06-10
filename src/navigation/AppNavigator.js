import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import DeviceKeySwitcher from 'screens/DeviceKeySwitcher';
import { deviceKeySwitch, tabs } from 'navigation/keys';
import MainTabNavigator from './MainTabNavigator';

/**
 * This is the root app navigator, rendered directly by {@link App.js}
 */
export default createAppContainer(
  createSwitchNavigator(
    {
      [deviceKeySwitch.key]: DeviceKeySwitcher,
      [tabs.key]: MainTabNavigator,
    },
    { initialRouteName: deviceKeySwitch.key }
  )
);
