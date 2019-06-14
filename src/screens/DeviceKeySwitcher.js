// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { selectDeviceKey, saveDeviceKey } from 'redux/ducks/auth';
// eslint-disable-next-line camelcase
import { $post, routes, CLIENT_ID as api_key } from 'utils/api';
import { tabs } from 'navigation/keys';
import type { NP } from 'utils/types';

type SP = { deviceSecretKey: ?string };
type DP = { saveSecret: string => void };
type P = SP & DP;

class DeviceKeySwitcher extends React.Component<P & NP> {
  componentDidMount() {
    const { deviceSecretKey, saveSecret } = this.props;
    if (deviceSecretKey) {
      this.goToTabs();
    } else {
      $post(routes.registerDevice, { api_key })
        .then(saveSecret)
        .then(this.goToTabs);
    }
  }

  goToTabs = () => this.props.navigation.navigate(tabs.key);

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

export default connect<P, *, *, *, *, *>(
  s => ({ ...selectDeviceKey(s) }),
  d => ({ saveSecret: s => d(saveDeviceKey(s)) })
)(DeviceKeySwitcher);
