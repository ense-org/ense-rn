// @flow
import 'utils/boot';
import React from 'react';
import { StatusBar, StyleSheet, View, Linking } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
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

type P = {||};

export default class App extends React.Component<P> {

  componentDidMount(): void {
    Linking.addEventListener('url', this._handleOpenURL);
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL);
  }

  _handleOpenURL = event => {
    global.deepLinkUrl = event.url;
  };

  render() {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <ThemeProvider theme={theme}>
            <ActionSheetProvider>
              <View style={styles.container}>
                {ifiOS(<StatusBar barStyle="default" />, null)}
                <AppNavigator />
              </View>
            </ActionSheetProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.gray['0'] } });
