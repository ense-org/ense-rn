// @flow
import React, { Component, isValidElement, type Node } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableNativeFeedback,
} from 'react-native';
import { isEqual } from 'lodash';
import { ifiOS } from 'utils/device';

export type ButtonProps = {
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
export default class Button extends Component<ButtonProps, S> {
  state = { loading: false };

  static defaultProps = {
    textStyle: undefined,
    disabledStyle: undefined,
    disabledTextStyle: undefined,
    activeOpacity: undefined,
    allowFontScaling: undefined,
    isLoading: false,
    disabled: false,
    activityIndicatorColor: 'gray',
    delayLongPress: undefined,
    delayPressIn: undefined,
    delayPressOut: undefined,
    onPress: undefined,
    onLongPress: undefined,
    onPressIn: undefined,
    onPressOut: undefined,
    background: TouchableNativeFeedback.SelectableBackground(),
    children: undefined,
    style: undefined,
  };

  _btnChildren = (): Node[] => {
    const { textStyle, disabled, allowFontScaling, children, disabledTextStyle } = this.props;
    const dStyle = disabled ? disabledTextStyle : {};
    const tStyle = [styles.textButton, textStyle, dStyle];
    return React.Children.toArray(children).map(c => {
      if (['string', 'number'].includes(typeof c)) {
        return (
          <Text style={tStyle} allowFontScaling={allowFontScaling} key={c}>
            {c}
          </Text>
        );
      }
      return isValidElement(c) ? c : null;
    });
  };

  shouldComponentUpdate(nextProps: ButtonProps) {
    return !isEqual(nextProps, this.props);
  }

  _innerText = () => {
    const { isLoading, activityIndicatorColor } = this.props;
    if (isLoading || this.state.loading) {
      return (
        <ActivityIndicator
          animating
          size="small"
          style={styles.spinner}
          color={activityIndicatorColor}
        />
      );
    }
    return this._btnChildren();
  };

  _wrapHandler = <T>(fn: () => Promise<T> | any) => (): Promise<T> | any => {
    const exec = fn();
    if (exec instanceof Promise) {
      this.setState({ loading: true });
      const noLoad = (v: T) => {
        this.setState({ loading: false });
        return v;
      };
      return exec.then(noLoad).catch(noLoad);
    }
    return exec;
  };

  _touchableProps = () => {
    const {
      onPress,
      onPressIn,
      onPressOut,
      onLongPress,
      activeOpacity,
      delayLongPress,
      delayPressIn,
      delayPressOut,
      background,
    } = this.props;
    return {
      onPress: onPress && this._wrapHandler(onPress),
      onPressIn,
      onPressOut,
      onLongPress,
      activeOpacity,
      delayLongPress,
      delayPressIn,
      delayPressOut,
      ...ifiOS(null, { background }),
    };
  };

  _disabled = () => (
    <View style={[styles.button, this.props.style, this.props.disabledStyle || styles.opacity]}>
      {this._innerText()}
    </View>
  );

  render() {
    const { style, isLoading, disabled } = this.props;
    const { loading } = this.state;
    if (disabled || isLoading || loading) {
      return this._disabled();
    }
    const touchableProps = this._touchableProps();
    return ifiOS(
      <TouchableOpacity {...touchableProps} style={[styles.button, style]}>
        {this._innerText()}
      </TouchableOpacity>,
      <TouchableNativeFeedback {...touchableProps}>
        <View style={[styles.button, style]}>{this._innerText()}</View>
      </TouchableNativeFeedback>
    );
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
