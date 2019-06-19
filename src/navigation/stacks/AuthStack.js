// @flow

import { authStack as k } from 'navigation/keys';
import SignInScreen from 'screens/SignInScreen';
import { stackNavigator } from 'navigation/helpers';

const AuthStack = stackNavigator({
  [k.signIn.key]: SignInScreen,
});

export default AuthStack;
