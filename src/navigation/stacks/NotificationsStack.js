// @flow

import SettingsScreen from 'screens/SettingsScreen';
import { stackNavigator, withTabBarOpts } from 'navigation/helpers';
import { ifiOS } from 'utils/device';

const NotificationsStack = stackNavigator({
  Notifications: SettingsScreen,
});

const label = 'notifications';
const iconName = ifiOS('ios-notifications', 'md-notifications');

export default withTabBarOpts({ label, iconName })(NotificationsStack);
