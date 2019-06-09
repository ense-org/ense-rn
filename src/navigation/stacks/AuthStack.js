// @flow

import React from 'react';
import { createStackNavigator } from 'react-navigation';
import SignInScreen from 'screens/SignInScreen';

// $FlowIssue - stack navigator flow bug
const AuthStack = createStackNavigator({
  SignIn: SignInScreen,
});

export default AuthStack;
