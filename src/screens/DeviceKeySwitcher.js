// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { type NavigationState, type NavigationScreenProp } from 'react-navigation';
import { deviceSecretKey as selectKey, saveDeviceKey } from 'redux/ducks/auth';
import { $post, routes, CLIENT_ID } from 'utils/api';
import { Main } from 'navigation/keys';

type OP = { navigation: NavigationScreenProp<NavigationState> };
type SP = { deviceSecretKey: ?string };
type DP = { saveSecret: string => void };
type P = OP & SP & DP;

class DeviceKeySwitcher extends React.Component<P> {
  _checkDeviceKey = () => {
    const { deviceSecretKey, saveSecret } = this.props;
    if (deviceSecretKey) {
      this.goToTabs();
    } else {
      $post(routes.registerDevice, { api_key: CLIENT_ID })
        .then(saveSecret)
        .then(this.goToTabs);
    }
  };

  componentDidMount() {
    this._checkDeviceKey();
  }

  goToTabs = () => this.props.navigation.navigate(Main.tabs);

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

export default connect(
  s => ({ ...selectKey(s) }),
  d => ({ saveSecret: s => d(saveDeviceKey(s)) })
)(DeviceKeySwitcher);
