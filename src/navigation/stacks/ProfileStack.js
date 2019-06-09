// @flow

import React from 'react';
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import TabBarIcon from 'components/TabBarIcon';
import SignInScreen from 'screens/SignInScreen';

const ProfileStack = createStackNavigator({
  SignIn: SignInScreen,
});

ProfileStack.navigationOptions = {
  tabBarLabel: 'Profile',
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="person" type="Octicons" />,
};

export default ProfileStack;
