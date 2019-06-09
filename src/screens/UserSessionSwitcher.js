// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { type NavigationState, type NavigationScreenProp } from 'react-navigation';
// import { } from 'redux/ducks/auth';

type OP = { navigation: NavigationScreenProp<NavigationState>, deviceSecretKey: ?string };
type DP = { saveSecret: string => void };
type P = OP & DP;

class UserSessionSwitcher extends React.Component<P> {
  _checkDeviceKey = () => {
    const { deviceSecretKey, saveSecret } = this.props;
    if (deviceSecretKey) {
      this.goTo('Profile');
    } else {
      this.goTo('Auth');
    }
  };

  componentDidMount() {
    this._checkDeviceKey();
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

export default connect(s => ({}))(UserSessionSwitcher);
