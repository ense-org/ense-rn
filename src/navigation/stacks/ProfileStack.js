// @flow

import { profileStack as k } from 'navigation/keys';
import MyProfileScreen from 'screens/ProfileScreen/MyProfileScreen';
import { stackNavigator } from 'navigation/helpers';

const ProfileStack = stackNavigator({
  [k.myProfile.key]: MyProfileScreen,
});

export default ProfileStack;
