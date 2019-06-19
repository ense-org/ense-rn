// @flow

import SettingsScreen from 'screens/SettingsScreen';
import { stackNavigator, withTabBarOpts } from 'navigation/helpers';

const SettingsStack = stackNavigator({
  Settings: SettingsScreen,
});

const label = 'etc';
const iconName = 'plus';
const iconType = 'Entypo';

export default withTabBarOpts({ label, iconName, iconType })(SettingsStack);
