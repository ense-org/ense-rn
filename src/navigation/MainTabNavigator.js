// @flow

import * as React from 'react';
import { createBottomTabNavigator } from 'react-navigation';

import FeedStack from './stacks/FeedStack';
import SettingsStack from './stacks/SettingsStack';
import ProfileStack from './stacks/ProfileStack';

export default createBottomTabNavigator({
  FeedStack,
  ProfileStack,
  SettingsStack,
});
