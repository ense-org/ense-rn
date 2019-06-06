// @flow

import React from 'react';
import { createStackNavigator } from 'react-navigation';
import { Platform } from 'react-native';

import TabBarIcon from '../../components/TabBarIcon';
import SettingsScreen from '../../screens/SettingsScreen';

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'} />
  ),
};

export default SettingsStack;
