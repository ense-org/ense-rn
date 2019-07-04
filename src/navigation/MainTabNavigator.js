// @flow

import { createBottomTabNavigator } from 'react-navigation';
import { tabs as k } from 'navigation/keys';
import BottomTabBar from 'components/BottomTabBar';
import Colors from 'constants/Colors';

import FeedStack from 'navigation/stacks/FeedStack';
import UserNavigator from 'navigation/UserNavigator';
import MentionsStack from 'navigation/stacks/MentionsStack';
import SearchStack from 'navigation/stacks/SearchStack';

export default createBottomTabNavigator(
  {
    [k.feedTab.key]: FeedStack,
    [k.userTab.key]: UserNavigator,
    [k.mentionsTab.key]: MentionsStack,
    [k.searchTab.key]: SearchStack,
  },
  {
    tabBarOptions: { activeTintColor: Colors.ense.black, showLabel: true },
    tabBarComponent: BottomTabBar,
  }
);
