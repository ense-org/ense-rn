// @flow

import * as React from 'react';
import { createBottomTabNavigator } from 'react-navigation';

import FeedStack from './stacks/FeedStack';
import SettingsStack from './stacks/SettingsStack';

export default createBottomTabNavigator({
  FeedStack,
  SettingsStack,
});
