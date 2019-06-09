import React from 'react';
import { createSwitchNavigator } from 'react-navigation';

import { User } from 'navigation/keys';
import SessionSwitcher from 'screens/UserSessionSwitcher';
import ProfileStack from './stacks/ProfileStack';

/**
 * This is the user profile navigator that switches on whether or not
 * someone is logged in
 */
export default createSwitchNavigator(
  {
    SessionSwitcher,
    [User.profile]: ProfileStack,
    [User.auth]: ProfileStack,
  },
  { initialRouteName: 'SessionSwitcher' }
);
