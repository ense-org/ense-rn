// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { createSelector } from 'redux-starter-kit';
import nav from '../navigation';

type P = {
  deviceSecretKey: ?string,
};

class AuthLoadingScreen extends React.Component<P> {
  componentDidMount(): void {
    const { deviceSecretKey } = this.props;
    this.props.navigation.navigate(deviceSecretKey ? nav.home : nav.auth);
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

const deviceSecretKey = createSelector(
  ['auth.deviceSecretKey'],
  t => t
);

const selector = s => ({ deviceSecretKey: deviceSecretKey(s) });

export default connect(selector)(AuthLoadingScreen);
