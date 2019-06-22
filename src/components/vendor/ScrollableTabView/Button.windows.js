import React from 'react';
import { TouchableOpacity } from 'react-native';

export default props => <TouchableOpacity {...props}>{props.children}</TouchableOpacity>;
