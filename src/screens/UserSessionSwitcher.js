// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { selectSessioned } from 'redux/ducks/auth';
import { profileStack, authStack } from 'navigation/keys';
import type { SelectedSessioned } from 'redux/ducks/auth';
import type { NP } from 'utils/types';

type OP = {};
type P = OP & SelectedSessioned;

class UserSessionSwitcher extends React.Component<P & NP> {
  componentDidMount() {
    const { sessioned } = this.props;
    if (sessioned) {
      this.goTo(profileStack.key);
    } else {
      this.goTo(authStack.key);
    }
  }

  goTo = (screen: string) => this.props.navigation.navigate(screen);

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

// eslint-disable-next-line no-undef
export default connect<P, OP, _, _, _, _>(s => ({ ...selectSessioned(s) }))(UserSessionSwitcher);
