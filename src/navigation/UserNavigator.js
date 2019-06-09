import React from 'react';
import { createSwitchNavigator } from 'react-navigation';

import { User } from 'navigation/keys';
import SessionSwitcher from 'screens/UserSessionSwitcher';
import TabBarIcon from 'components/TabBarIcon';
import ProfileStack from './stacks/ProfileStack';
import AuthStack from './stacks/AuthStack';

/**
 * This is the user profile navigator that switches on whether or not
 * someone is logged in
 */
const Navigator = createSwitchNavigator(
  {
    SessionSwitcher,
    [User.profile]: ProfileStack,
    [User.auth]: AuthStack,
  },
  { initialRouteName: 'SessionSwitcher' }
);

Navigator.navigationOptions = {
  tabBarLabel: 'Profile',
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="person" type="Octicons" />,
};

export default Navigator;
