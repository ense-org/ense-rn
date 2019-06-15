// @flow

import { createStackNavigator } from 'react-navigation';

import Playback from 'screens/TestPlayback';
import { withTabBarOpts } from 'navigation/helpers';
import { ifiOS } from 'utils/device';

const NotificationsStack = createStackNavigator({
  Notifications: Playback,
});

const label = 'notifications';
const iconName = ifiOS('ios-notifications', 'md-notifications');

export default withTabBarOpts({ label, iconName })(NotificationsStack);
