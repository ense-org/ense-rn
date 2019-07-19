// @flow
import * as React from 'react';
import TabBarIcon from 'components/TabBarIcon';
import type {
  NavigationRouteConfigMap,
  NavigationNavigator,
  NavigationContainer,
  StackNavigatorConfig,
} from 'react-navigation';
import { createStackNavigator } from 'react-navigation';
import Colors from 'constants/Colors';
import type { IconType } from 'react-native-elements';

type Opts = { label?: string, iconName: string, iconType?: IconType };

/**
 * HOC for consistent tab bar option adding
 */
export const withTabBarOpts = (opts: Opts) => (C: NavigationNavigator<*, *, *>) => {
  const { label, iconName, iconType } = opts;
  C.navigationOptions = {
    tabBarLabel: label,
    tabBarIcon: ({ focused }) => (
      <TabBarIcon
        focused={focused}
        name={iconName}
        type={iconType || TabBarIcon.defaultProps.type}
      />
    ),
  };
  return C;
};

export const stackConfigs = {
  defaultNavigationOptions: {
    headerTintColor: Colors.headerTint,
    headerStyle: { backgroundColor: '#fff' },
  },
};

export const stackNavigator = (
  map: NavigationRouteConfigMap,
  config?: StackNavigatorConfig
): NavigationContainer<*, *, *> => createStackNavigator(map, { ...stackConfigs, ...config });
