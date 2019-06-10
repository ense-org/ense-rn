// @flow

import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { profileStack as k } from 'navigation/keys';
import ProfileScreen from 'screens/ProfileScreen';

const ProfileStack = createStackNavigator({
  [k.profilePage.key]: ProfileScreen,
});

export default ProfileStack;
