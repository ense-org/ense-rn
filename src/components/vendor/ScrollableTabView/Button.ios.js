import React from 'react';
import ReactNative from 'react-native';

const { TouchableOpacity } = ReactNative;

export default props => <TouchableOpacity {...props}>{props.children}</TouchableOpacity>;
