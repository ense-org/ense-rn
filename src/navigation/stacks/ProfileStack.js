// @flow

import { profileStack as k } from 'navigation/keys';
import MyProfileScreen from 'screens/ProfileScreen/MyProfileScreen';
import { stackNavigator } from 'navigation/helpers';
import EnseUrlScreen from 'screens/EnseUrlScreen';
import PublicProfileScreen from 'screens/ProfileScreen/PublicProfileScreen';
import PublicAccountsScreen from 'screens/PublicAccountsScreen';

const ProfileStack = stackNavigator({
  [k.myProfile.key]: MyProfileScreen,
  [k.pubProfile.key]: PublicProfileScreen,
  [k.enseUrlList.key]: EnseUrlScreen,
  [k.accountsList.key]: PublicAccountsScreen,
});

export default ProfileStack;
