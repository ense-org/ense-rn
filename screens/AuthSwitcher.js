// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { createSelector } from 'redux-starter-kit';
import nav from '../navigation';

type P = {
  authToken: ?string,
};

class AuthLoadingScreen extends React.Component<P> {
  componentDidMount(): void {
    const { authToken } = this.props;
    this.props.navigation.navigate(authToken ? nav.home : nav.auth);
  }

  render(): React.Node {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const authToken = createSelector(
  ['auth.token'],
  t => t
);

const selector = s => ({ authToken: authToken(s) });

export default connect(selector)(AuthLoadingScreen);
