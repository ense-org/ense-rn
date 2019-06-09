// @flow

import React from 'react';
import { createStackNavigator } from 'react-navigation';
import ProfileScreen from 'screens/ProfileScreen';

const ProfileStack = createStackNavigator({
  Profile: ProfileScreen,
});

export default ProfileStack;
