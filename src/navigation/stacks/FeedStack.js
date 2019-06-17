// @flow

import { createStackNavigator } from 'react-navigation';
import FeedScreen from 'screens/FeedScreen/index';
import { feedTab as k } from 'navigation/keys';
import { withTabBarOpts } from 'navigation/helpers';

const FeedStack = createStackNavigator({
  [k.home.key]: FeedScreen,
  [k.home.key]: FeedScreen,
});

const tabInfo = { label: 'home', iconName: 'home', iconType: 'Entypo' };
export default withTabBarOpts(tabInfo)(FeedStack);
