// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { type NavigationState, type NavigationScreenProp } from 'react-navigation';
import nav from 'navigation/index';
import { deviceSecretKey as selectKey, save } from 'redux/ducks/auth';
import { $post, CLIENT_ID } from 'utils/api';
import routes from 'utils/api/routes';

type OP = {
  navigation: NavigationScreenProp<NavigationState>,
  deviceSecretKey: ?string,
};
type DP = {
  saveSecret: string => void,
};

type P = OP & DP;

class AuthLoadingScreen extends React.Component<P> {
  componentDidMount(): void {
    const { deviceSecretKey, saveSecret } = this.props;
    if (deviceSecretKey) {
      this.goToTabs();
    } else {
      $post(routes.registerDevice, { api_key: CLIENT_ID })
        .then(saveSecret)
        .then(this.goToTabs);
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
const dispatch = d => ({ saveSecret: s => d(save(s)) });

export default connect(
  selector,
  dispatch
)(AuthLoadingScreen);
