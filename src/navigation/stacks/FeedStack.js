// @flow

import { createStackNavigator } from 'react-navigation';
import FeedScreen from 'screens/FeedScreen/index';
import { withTabBarOpts } from 'navigation/helpers';

const FeedStack = createStackNavigator({
  Home: FeedScreen,
});

const tabInfo = { label: 'Home', iconName: 'home', iconType: 'Entypo' };
export default withTabBarOpts(tabInfo)(FeedStack);
