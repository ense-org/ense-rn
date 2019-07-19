// @flow
import React from 'react';
import { Icon, type IconType } from 'react-native-elements';

import Colors from 'constants/Colors';

type P = {
  name: string,
  type?: IconType,
  focused: boolean,
};

export default class TabBarIcon extends React.Component<P> {
  static defaultProps = { type: 'ionicon' };

  render() {
    const { type, name, focused } = this.props;
    return (
      <Icon
        type={type}
        name={name}
        size={26}
        style={{ marginBottom: -3 }}
        color={focused ? Colors.gray['5'] : Colors.gray['2']}
      />
    );
  }
}
