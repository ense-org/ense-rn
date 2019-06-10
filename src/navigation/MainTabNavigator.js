// @flow

import * as React from 'react';
import { createBottomTabNavigator } from 'react-navigation';
import { tabs as k } from 'navigation/keys';
import Colors from 'constants/Colors';

import FeedStack from './stacks/FeedStack';
import SettingsStack from './stacks/SettingsStack';
import UserNavigator from './UserNavigator';

export default createBottomTabNavigator(
  {
    [k.feedTab.key]: FeedStack,
    [k.userTab.key]: UserNavigator,
    [k.settingsTab.key]: SettingsStack,
  },
  { tabBarOptions: { activeTintColor: Colors.ense.black } }
);
