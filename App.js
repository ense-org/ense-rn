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
import theme from 'utils/theme';

// persistor.purge();

export default class App extends React.Component {
  state = { isLoadingComplete: false };

  render() {
    if (!this.state.isLoadingComplete) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
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
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([require('./assets/images/icon.png')]),
      // ...[AntDesign, Entypo].map(Font.loadAsync),
    ]);
  };

  _handleLoadingError = error => {
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
