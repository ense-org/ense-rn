// @flow
import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableNativeFeedback,
  Platform,
} from 'react-native';
import { isEqual } from 'lodash';
import { ifiOS } from 'utils/device';

type P = {
  textStyle?: Object,
  disabledStyle?: Object,
  disabledTextStyle?: Object,
  activeOpacity?: number,
  allowFontScaling?: boolean,
  isLoading?: boolean,
  disabled?: boolean,
  activityIndicatorColor?: string,
  delayLongPress?: number,
  delayPressIn?: number,
  delayPressOut?: number,
  onPress?: () => any,
  onLongPress?: () => any,
  onPressIn?: () => any,
  onPressOut?: () => any,
  background?: any,
  children?: any,
  style?: Object,
};
type S = {
  loading: boolean,
};

/**
 * Vendored from: https://github.com/APSL/react-native-button -- could use some refactoring
 */
export default class Button extends Component<P, S> {
  state = { loading: false };
  static isAndroid = Platform.OS === 'android';
  static defaultProps = {
    textStyle: undefined,
    disabledStyle: undefined,
    disabledTextStyle: undefined,
    activeOpacity: undefined,
    allowFontScaling: undefined,
    isLoading: false,
    disabled: false,
    activityIndicatorColor: undefined,
    delayLongPress: undefined,
    delayPressIn: undefined,
    delayPressOut: undefined,
    onPress: undefined,
    onLongPress: undefined,
    onPressIn: undefined,
    onPressOut: undefined,
    background: undefined,
    children: undefined,
    style: undefined,
  };

  _renderChildren() {
    const childElements = [];
    const { textStyle, disabled, allowFontScaling, children, disabledTextStyle } = this.props;
    const dStyle = disabled ? disabledTextStyle : {};
    const tStyle = [styles.textButton, textStyle, dStyle];
    React.Children.forEach(children, item => {
      if (typeof item === 'string' || typeof item === 'number') {
        childElements.push(
          <Text style={tStyle} allowFontScaling={allowFontScaling} key={item}>
            {item}
          </Text>
        );
      } else if (React.isValidElement(item)) {
        childElements.push(item);
      }
    });
    return childElements;
  }

  shouldComponentUpdate(nextProps: P) {
    return !isEqual(nextProps, this.props);
  }

  _renderInnerText() {
    if (this.props.isLoading || this.state.loading) {
      return (
        <ActivityIndicator
          animating
          size="small"
          style={styles.spinner}
          color={this.props.activityIndicatorColor || 'gray'}
        />
      );
    }
    return this._renderChildren();
  }

  _wrapOnPress = <T>(fn: () => any) => () => {
    const exec = fn();
    if (exec instanceof Promise) {
      this.setState({ loading: true });
      return exec.finally(() => this.setState({ loading: false }));
    }
  };

  render() {
    const { onPress } = this.props;
    if (this.props.disabled === true || this.props.isLoading === true) {
      return (
        <View style={[styles.button, this.props.style, this.props.disabledStyle || styles.opacity]}>
          {this._renderInnerText()}
        </View>
      );
    }
    let touchableProps = {
      onPress: onPress ? this._wrapOnPress(onPress) : onPress,
      onPressIn: this.props.onPressIn,
      onPressOut: this.props.onPressOut,
      onLongPress: this.props.onLongPress,
      activeOpacity: this.props.activeOpacity,
      delayLongPress: this.props.delayLongPress,
      delayPressIn: this.props.delayPressIn,
      delayPressOut: this.props.delayPressOut,
    };
    if (Button.isAndroid) {
      touchableProps = {
        ...touchableProps,
        background: this.props.background || TouchableNativeFeedback.SelectableBackground(),
      };
      return (
        <TouchableNativeFeedback {...touchableProps}>
          <View style={[styles.button, this.props.style]}>{this._renderInnerText()}</View>
        </TouchableNativeFeedback>
      );
    } else {
      return (
        <TouchableOpacity {...touchableProps} style={[styles.button, this.props.style]}>
          {this._renderInnerText()}
        </TouchableOpacity>
      );
    }
  }
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderWidth: ifiOS(0, 1),
    borderRadius: 3,
    marginBottom: 10,
    justifyContent: 'center',
  },
  textButton: {
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  spinner: { alignSelf: 'center' },
  opacity: { opacity: 0.5 },
});
