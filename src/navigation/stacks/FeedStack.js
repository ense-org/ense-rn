// @flow

import { createStackNavigator } from 'react-navigation';
import FeedScreen from 'screens/FeedScreen/index';
import { feedTab as k } from 'navigation/keys';
import { withTabBarOpts } from 'navigation/helpers';
import PublicProfileScreen from 'screens/ProfileScreen/PublicProfileScreen';

const FeedStack = createStackNavigator({
  [k.home.key]: FeedScreen,
  [k.pubProfile.key]: PublicProfileScreen,
});

const tabInfo = { label: 'home', iconName: 'home', iconType: 'Entypo' };
export default withTabBarOpts(tabInfo)(FeedStack);
