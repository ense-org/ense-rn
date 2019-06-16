// @flow

import { createBottomTabNavigator } from 'react-navigation';
import { tabs as k } from 'navigation/keys';
import BottomTabBar from 'components/BottomTabBar';
import Colors from 'constants/Colors';

import FeedStack from './stacks/FeedStack';
import SettingsStack from './stacks/SettingsStack';
import NotificationsStack from './stacks/NotificationsStack';
import UserNavigator from './UserNavigator';

export default createBottomTabNavigator(
  {
    [k.feedTab.key]: FeedStack,
    [k.userTab.key]: UserNavigator,
    [k.notificationsTab.key]: NotificationsStack,
    [k.settingsTab.key]: SettingsStack,
  },
  { tabBarOptions: { activeTintColor: Colors.ense.black }, tabBarComponent: BottomTabBar }
);
