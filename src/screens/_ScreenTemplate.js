// @flow

import React from 'react';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';
import { Header } from 'react-native-elements';

type P = {||};

export default class _Screen extends React.Component<P> {
  _close = () => this.props.cancel().then(() => this.props.navigation.goBack(null));
  _leftComponent = () => ({ text: 'Cancel', onPress: this._close, style: styles.cancel });

  render() {
    return (
      <KeyboardAvoidingView style={styles.root} behavior="height">
        <Header leftComponent={this._leftComponent()} />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'column', backgroundColor: 'white' },
  cancel: {},
});
