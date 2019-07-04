// @flow

import SettingsScreen from 'screens/SettingsScreen';
import { stackNavigator, withTabBarOpts } from 'navigation/helpers';

const SettingsStack = stackNavigator({
  Settings: SettingsScreen,
});

const label = 'search';
const iconName = 'search';
const iconType = 'Feather';
export default withTabBarOpts({ label, iconName, iconType })(SettingsStack);
