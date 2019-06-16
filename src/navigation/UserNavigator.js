import { createSwitchNavigator } from 'react-navigation';
import { userTab as k } from 'navigation/keys';
import { withTabBarOpts } from 'navigation/helpers';
import SessionSwitcher from 'screens/UserSessionSwitcher';
import ProfileStack from './stacks/ProfileStack';
import AuthStack from './stacks/AuthStack';

/**
 * This is the user profile navigator that switches on whether or not
 * someone is logged in
 */
const Navigator = createSwitchNavigator(
  {
    [k.sessionSwitch.key]: SessionSwitcher,
    [k.profileStack.key]: ProfileStack,
    [k.authStack.key]: AuthStack,
  },
  { initialRouteName: 'SessionSwitcher' }
);

const tabInfo = { label: 'profile', iconName: 'person', iconType: 'Octicons' };

export default withTabBarOpts(tabInfo)(Navigator);
