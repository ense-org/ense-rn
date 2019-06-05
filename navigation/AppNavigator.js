import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import AuthSwitcher from '../screens/AuthSwitcher';

const Navigator = createAppContainer(
  createSwitchNavigator(
    {
      AuthSwitcher,
      Home: MainTabNavigator,
    },
    { initialRouteName: 'AuthSwitcher' }
  )
);

export default Navigator;
