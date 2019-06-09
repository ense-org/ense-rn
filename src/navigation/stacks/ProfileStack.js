// @flow

import React from 'react';
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import TabBarIcon from 'components/TabBarIcon';
import SignInScreen from 'screens/SignInScreen';
import SessionSwitcher from 'screens/UserSessionSwitcher';

const ProfileStack = createStackNavigator({
  SignIn: SignInScreen,
});

ProfileStack.navigationOptions = {
  tabBarLabel: 'Profile',
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="person" type="Octicons" />,
};

const Switch = createSwitchNavigator(
  {
    SessionSwitcher,
    Profile: ProfileStack,
    Auth: ProfileStack,
  },
  { initialRouteName: 'SessionSwitcher' }
);
export default ProfileStack;
