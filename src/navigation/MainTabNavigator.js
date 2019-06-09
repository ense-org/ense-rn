// @flow

import * as React from 'react';
import { createBottomTabNavigator } from 'react-navigation';
import Colors from 'constants/Colors';

import FeedStack from './stacks/FeedStack';
import SettingsStack from './stacks/SettingsStack';
import UserNavigator from './UserNavigator';

export default createBottomTabNavigator(
  {
    FeedStack,
    UserNavigator,
    SettingsStack,
  },
  { tabBarOptions: { activeTintColor: Colors.ense.black } }
);
