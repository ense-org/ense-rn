import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import AuthStack from './stacks/AuthStack';
import AuthSwitcher from '../screens/AuthSwitcher';
import navigators from './index';

/**
 * This is the root app navigator, rendered directly by {@link App.js}
 */
export default createAppContainer(
  createSwitchNavigator(
    {
      AuthSwitcher,
      [navigators.auth]: AuthStack,
      [navigators.tabs]: MainTabNavigator,
    },
    { initialRouteName: 'AuthSwitcher' }
  )
);
