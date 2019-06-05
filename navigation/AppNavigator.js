import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import AuthSwitcher from '../screens/AuthSwitcher';
import navigators from './index';


const Navigator = createAppContainer(
  createSwitchNavigator(
    {
      AuthSwitcher,
      [navigators.auth]: AuthNavigator,
      [navigators.home]: MainTabNavigator,
    },
    { initialRouteName: 'AuthSwitcher' }
  )
);

export default Navigator;
