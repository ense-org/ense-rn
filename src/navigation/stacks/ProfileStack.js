// @flow

import { createStackNavigator } from 'react-navigation';
import { profileStack as k } from 'navigation/keys';
import MyProfileScreen from 'screens/ProfileScreen/MyProfileScreen';

const ProfileStack = createStackNavigator({
  [k.myProfile.key]: MyProfileScreen,
});

export default ProfileStack;
