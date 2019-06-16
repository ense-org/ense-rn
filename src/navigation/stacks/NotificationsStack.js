// @flow

import { createStackNavigator } from 'react-navigation';

import SettingsScreen from 'screens/SettingsScreen';
import { withTabBarOpts } from 'navigation/helpers';
import { ifiOS } from 'utils/device';

const NotificationsStack = createStackNavigator({
  Notifications: SettingsScreen,
});

const label = 'notifications';
const iconName = ifiOS('ios-notifications', 'md-notifications');

export default withTabBarOpts({ label, iconName })(NotificationsStack);
