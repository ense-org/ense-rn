// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { type NavigationState, type NavigationScreenProp } from 'react-navigation';
import { selectUser } from 'redux/ducks/auth';
import type { SelectedUser } from 'redux/ducks/auth';

type NP = { navigation: NavigationScreenProp<NavigationState> };
type P = NP & SelectedUser;

class UserSessionSwitcher extends React.Component<P> {
  componentDidMount() {
    const { user } = this.props;
    console.log('user', user);
    if (user) {
      this.goTo('Profile');
    } else {
      this.goTo('Auth');
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

export default connect(s => ({ ...selectUser(s) }))(UserSessionSwitcher);
