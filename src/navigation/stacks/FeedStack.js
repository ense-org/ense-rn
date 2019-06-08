// @flow

import React from 'react';
import { createStackNavigator } from 'react-navigation';

import TabBarIcon from 'components/TabBarIcon';
import FeedScreen from 'screens/FeedScreen';

const FeedStack = createStackNavigator({
  Home: FeedScreen,
});

FeedStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="home" type="Entypo" />,
};

export default FeedStack;
