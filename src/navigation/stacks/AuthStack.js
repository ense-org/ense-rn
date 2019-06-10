// @flow

import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { authStack as k } from 'navigation/keys';
import SignInScreen from 'screens/SignInScreen';

const AuthStack = createStackNavigator({
  [k.signIn.key]: SignInScreen,
});

export default AuthStack;
