// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { type NavigationState, type NavigationScreenProp } from 'react-navigation';
import { selectSessioned } from 'redux/ducks/auth';
import { profileStack, authStack } from 'navigation/keys';
import type { SelectedSessioned } from 'redux/ducks/auth';

type NP = { navigation: NavigationScreenProp<NavigationState> };
type P = NP & SelectedSessioned;

class UserSessionSwitcher extends React.Component<P> {
  componentDidMount() {
    const { sessioned } = this.props;
    if (sessioned) {
      this.goTo(profileStack.key);
    } else {
      this.goTo(authStack.key);
    }
  }

  goTo = screen => this.props.navigation.navigate(screen);

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

export default connect(s => ({ ...selectSessioned(s) }))(UserSessionSwitcher);
