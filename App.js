import 'utils/boot';
import React from 'react';
import { StatusBar, StyleSheet, View, AsyncStorage } from 'react-native';
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

export default class App extends React.Component {
  getToken = async () => {
    firebase.messaging().onTokenRefresh(fcmToken => {
      $post(routes.pushToken, { push_token: fcmToken });
    });
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        $post(routes.pushToken, { push_token: fcmToken });
        await AsyncStorage.setItem('fcmToken', fcmToken);
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
        <ThemeProvider theme={theme}>
          <PersistGate persistor={persistor}>
            <ActionSheetProvider>
              <View style={styles.container}>
                {ifiOS(<StatusBar barStyle="default" />, null)}
                <AppNavigator />
              </View>
            </ActionSheetProvider>
          </PersistGate>
        </ThemeProvider>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.gray['0'] } });
