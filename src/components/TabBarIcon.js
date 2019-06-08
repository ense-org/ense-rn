// @flow
import React from 'react';
import * as Icon from '@expo/vector-icons';
import type { IconType } from 'utils/types';

import Colors from 'constants/Colors';

type P = {
  name: string,
  type?: IconType,
  focused: boolean,
};

export default class TabBarIcon extends React.Component<P> {
  static defaultProps = {
    type: 'Ionicons',
  };

  render() {
    const { type, name, focused } = this.props;
    const IconComponent = Icon[type];
    return (
      <IconComponent
        name={name}
        size={26}
        style={{ marginBottom: -3 }}
        color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
    );
  }
}
