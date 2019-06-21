// @flow

import FeedScreen from 'screens/FeedScreen/index';
import { feedTab as k } from 'navigation/keys';
import { stackNavigator, withTabBarOpts } from 'navigation/helpers';
import PublicProfileScreen from 'screens/ProfileScreen/PublicProfileScreen';
import TopicScreen from 'screens/TopicScreen';
import PublicAccountsScreen from 'screens/PublicAccountsScreen';

const FeedStack = stackNavigator({
  [k.home.key]: FeedScreen,
  [k.pubProfile.key]: PublicProfileScreen,
  [k.topicEnses.key]: TopicScreen,
  [k.accountsList.key]: PublicAccountsScreen,
});

const tabInfo = { label: 'home', iconName: 'home', iconType: 'Entypo' };
export default withTabBarOpts(tabInfo)(FeedStack);
