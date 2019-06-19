// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { selectSessioned } from 'redux/ducks/auth';
import { profileStack, authStack } from 'navigation/keys';
import type { SelectedSessioned } from 'redux/ducks/auth';
import type { NP } from 'utils/types';

type P = {| ...SelectedSessioned, ...NP |};

class UserSessionSwitcher extends React.Component<P> {
  componentDidMount() {
    this.goTo(this.props.sessioned ? profileStack.key : authStack.key);
  }

  goTo = (screen: string) => this.props.navigation.navigate(screen);

  render() {
    return (
      <View style={styles.root}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default connect<P, *, *, *, *, *>(s => ({ ...selectSessioned(s) }))(UserSessionSwitcher);
