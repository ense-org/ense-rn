// @flow

import { profileStack as k } from 'navigation/keys';
import MyProfileScreen from 'screens/ProfileScreen/MyProfileScreen';
import { stackNavigator } from 'navigation/helpers';
import TopicScreen from 'screens/TopicScreen';
import PublicProfileScreen from 'screens/ProfileScreen/PublicProfileScreen';

const ProfileStack = stackNavigator({
  [k.myProfile.key]: MyProfileScreen,
  [k.pubProfile.key]: PublicProfileScreen,
  [k.topicEnses.key]: TopicScreen,
});

export default ProfileStack;
