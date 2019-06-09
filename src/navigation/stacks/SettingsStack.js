// @flow

import { createStackNavigator } from 'react-navigation';

import SettingsScreen from 'screens/SettingsScreen';
import { withTabBarOpts } from 'navigation/helpers';
import { ifiOS } from 'utils/device';

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

const label = 'Settings';
const iconName = ifiOS('ios-options', 'md-options');

export default withTabBarOpts({ label, iconName })(SettingsStack);
