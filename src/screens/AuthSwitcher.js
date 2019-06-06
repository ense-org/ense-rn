// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import nav from 'navigation';
import { deviceSecretKey as selectKey } from 'redux/ducks/auth';
import { $post, CLIENT_ID } from 'utils/api';

type P = {
  deviceSecretKey: ?string,
};

class AuthLoadingScreen extends React.Component<P> {
  componentDidMount(): void {
    const { deviceSecretKey } = this.props;
    if (deviceSecretKey) {
      this.goToTabs();
    } else {
      $post('/device/register', { api_key: CLIENT_ID }).then(r => {
        debugger;
      });
    }
  }

  goToTabs = () => this.props.navigation.navigate(nav.tabs);

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

const selector = s => ({ ...selectKey(s) });

export default connect(selector)(AuthLoadingScreen);
