// @flow

import { stackNavigator, withTabBarOpts } from 'navigation/helpers';
import SearchScreen from 'screens/SearchScreen';
import { searchTab as k } from 'navigation/keys';

const SearchStack = stackNavigator({
  // $FlowIgnore
  [k.main.key]: SearchScreen,
});

const label = 'search';
const iconName = 'search';
const iconType = 'enseicons';
export default withTabBarOpts({ label, iconName, iconType })(SearchStack);
