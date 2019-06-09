import { createSwitchNavigator } from 'react-navigation';
import { User } from 'navigation/keys';
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
    SessionSwitcher,
    [User.profile]: ProfileStack,
    [User.auth]: AuthStack,
  },
  { initialRouteName: 'SessionSwitcher' }
);

const tabInfo = { label: 'Profile', iconName: 'person', iconType: 'Octicons' };

export default withTabBarOpts(tabInfo)(Navigator);
