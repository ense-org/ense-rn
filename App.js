import 'utils/boot';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import { ThemeProvider } from 'react-native-elements';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppNavigator from 'navigation/AppNavigator';
import { persistor, store } from 'redux/store';
import { ifiOS } from 'utils/device';
import Colors from 'constants/Colors';
import theme from 'utils/theme';

// Dev: Reset all redux persisted state on app start
// persistor.purge();

export default class App extends React.Component {
  state = { doneLoading: false };

  render() {
    return this.state.doneLoading ? (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <PersistGate persistor={persistor}>
            <View style={styles.container}>
              {ifiOS(<StatusBar barStyle="default" />, null)}
              <AppNavigator />
            </View>
          </PersistGate>
        </ThemeProvider>
      </Provider>
    ) : (
      <AppLoading
        startAsync={this._loadResources}
        onError={this._onLoadError}
        onFinish={this._onLoad}
      />
    );
  }
  _onLoadError = console.warn;
  _onLoad = () => this.setState({ doneLoading: true });
  _loadResources = async () =>
    Promise.all([Asset.loadAsync([require('./assets/images/icon.png')])]);
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.gray['0'] } });
