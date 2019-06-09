// @flow
import * as React from 'react';
import TabBarIcon from 'components/TabBarIcon';
import type { IconType } from 'utils/types';
import type { NavigationNavigator } from 'react-navigation';

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
