// @flow

import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NP } from 'utils/types';
import { Header } from 'react-native-elements';
import AccountList from 'components/AccountList';

type DP = {||};
type SP = {||};
type P = {| ...DP, ...NP, ...SP |};

class EnseListensScreen extends React.Component<P> {
  _close = () => this.props.navigation.goBack(null);

  _leftComponent = () => ({ text: 'Close', onPress: this._close, style: styles.cancel });

  render() {
    return (
      <View style={styles.root}>
        <Header leftComponent={this._leftComponent()} containerStyle={styles.header} />
        <View style={styles.content}>
          <AccountList accounts={this.props.accounts} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'column' },
  content: { flexDirection: 'column', flex: 1 },
  header: { borderBottomWidth: 0, justifyContent: 'space-between', flexDirection: 'row' },
});
