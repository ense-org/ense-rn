// @flow
import 'utils/boot';
import React from 'react';
import { StatusBar, StyleSheet, View, AsyncStorage, Platform } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { ThemeProvider } from 'react-native-elements';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppNavigator from 'navigation/AppNavigator';
import { persistor, store } from 'redux/store';
import { ifiOS } from 'utils/device';
import Colors from 'constants/Colors';
import theme from 'utils/theme';
import firebase from 'react-native-firebase';
import type { Notification, NotificationOpen } from 'react-native-firebase';
import routes from 'utils/api/routes';
import { $post } from 'utils/api';

// Dev: Reset all redux persisted state on app start
// persistor.purge();

type P = {||};

export default class App extends React.Component<P> {
  getToken = async () => {
    firebase.messaging().onTokenRefresh(async fcmToken => {
      console.log('refresh', fcmToken);
      await AsyncStorage.setItem('fcmToken', fcmToken);
      $post(routes.pushToken, { push_token: fcmToken, push_type: Platform.OS });
    });
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log('has token', fcmToken);
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        console.log('get token', fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
        await $post(routes.pushToken, { push_token: fcmToken, push_type: Platform.OS });
      }
    }
  };

  checkPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      await this.getToken();
    } else {
      try {
        await firebase.messaging().requestPermission();
      } catch (error) {
        console.log('permission rejected');
      }
    }
  };

  async componentDidMount() {
    await this.checkPermission();
    this.removeNotificationDisplayedListener = firebase
      .notifications()
      .onNotificationDisplayed((notification: Notification) => {
        // Process your notification as required
        // ANDROID: Remote notifications do not contain the channel ID.
        // You will have to specify this manually if you'd like to re-display the notification.
        firebase.analytics().logEvent('notif_v2_on_notif_disp', notification);
      });
    this.removeNotificationListener = firebase
      .notifications()
      .onNotification((notification: Notification) => {
        firebase.analytics().logEvent('notif_v2_on_notif', notification);
        // Process your notification as required
      });
    this.removeNotificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen: NotificationOpen) => {
        // Get the action triggered by the notification being opened
        const action = notificationOpen.action;
        // Get information about the notification that was opened
        const notification: Notification = notificationOpen.notification;
        firebase.analytics().logEvent('notif_v2', notificationOpen);
      });
  }

  componentWillUnmount() {
    this.removeNotificationDisplayedListener();
    this.removeNotificationOpenedListener();
    this.removeNotificationListener();
  }

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
