// @flow

import FeedScreen from 'screens/FeedScreen/index';
import { feedTab as k } from 'navigation/keys';
import { stackNavigator, withTabBarOpts } from 'navigation/helpers';
import PublicProfileScreen from 'screens/ProfileScreen/PublicProfileScreen';

const FeedStack = stackNavigator({
  [k.home.key]: FeedScreen,
  [k.pubProfile.key]: PublicProfileScreen,
});

const tabInfo = { label: 'home', iconName: 'home', iconType: 'Entypo' };
export default withTabBarOpts(tabInfo)(FeedStack);
