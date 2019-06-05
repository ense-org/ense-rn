// @flow

import React from 'react';
import { createStackNavigator } from 'react-navigation';
import SignInScreen from '../screens/SignInScreen';

export default createStackNavigator({ SignIn: SignInScreen });
