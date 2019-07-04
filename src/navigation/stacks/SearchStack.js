// @flow

import { stackNavigator, withTabBarOpts } from 'navigation/helpers';
import SearchScreen from 'screens/SearchScreen';
import { searchTab as k } from 'navigation/keys';

const SettingsStack = stackNavigator({
  // $FlowIgnore
  [k.main.key]: SearchScreen,
});

const label = 'search';
const iconName = 'search';
const iconType = 'Feather';
export default withTabBarOpts({ label, iconName, iconType })(SettingsStack);
