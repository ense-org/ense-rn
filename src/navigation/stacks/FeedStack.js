// @flow

import { feedTab as k } from 'navigation/keys';
import { stackNavigator, withTabBarOpts } from 'navigation/helpers';
import FeedScreen from 'screens/FeedScreen/index';
import PublicProfileScreen from 'screens/ProfileScreen/PublicProfileScreen';
import EnseUrlScreen from 'screens/EnseUrlScreen';
import PublicAccountsScreen from 'screens/PublicAccountsScreen';

const FeedStack = stackNavigator({
  [k.home.key]: FeedScreen,
  [k.pubProfile.key]: PublicProfileScreen,
  [k.enseUrlList.key]: EnseUrlScreen,
  [k.accountsList.key]: PublicAccountsScreen,
});

const tabInfo = { label: 'home', iconName: 'home', iconType: 'Feather' };
export default withTabBarOpts(tabInfo)(FeedStack);
