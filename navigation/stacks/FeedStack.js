// @flow

import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { Platform } from 'react-native';

import TabBarIcon from '../../components/TabBarIcon';
import FeedScreen from '../../screens/FeedScreen';

const FeedStack = createStackNavigator({
  Home: FeedScreen,
});

FeedStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

export default FeedStack;
