// @flow

import { createStackNavigator } from 'react-navigation';

import SettingsScreen from 'screens/SettingsScreen';
import { withTabBarOpts } from 'navigation/helpers';

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

const label = 'etc';
const iconName = 'plus';
const iconType = 'Entypo';

export default withTabBarOpts({ label, iconName, iconType })(SettingsStack);
