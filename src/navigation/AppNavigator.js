// @flow
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import DeviceKeySwitcher from 'screens/DeviceKeySwitcher';
import { deviceKeySwitch, tabs, root } from 'navigation/keys';
import { stackNavigator } from 'navigation/helpers';
import MainTabNavigator from 'navigation/MainTabNavigator';
import Colors from 'constants/Colors';
import PostEnseScreen from 'screens/PostEnseScreen';
import FullPlayerScreen from 'screens/FullPlayerScreen';
import EditProfileScreen from 'screens/EditProfileScreen';
import SettingsScreen from 'screens/SettingsScreen';
import EmojiReactScreen from 'screens/EmojiReactScreen';

const MainSwitch = createSwitchNavigator(
  {
    [deviceKeySwitch.key]: DeviceKeySwitcher,
    [tabs.key]: MainTabNavigator,
  },
  { initialRouteName: deviceKeySwitch.key }
);

const RootStack = stackNavigator(
  {
    [root.main.key]: { screen: MainSwitch },
    [root.postEnseModal.key]: { screen: PostEnseScreen },
    [root.addReaction.key]: { screen: EmojiReactScreen },
    [root.fullPlayer.key]: { screen: FullPlayerScreen },
    [root.editProfile.key]: { screen: EditProfileScreen },
    [root.settings.key]: { screen: SettingsScreen },
  },
  {
    mode: 'modal',
    headerMode: 'none',
    cardStyle: { opacity: 1, backgroundColor: Colors.gray['0'] },
  }
);

/**
 * This is the root app navigator, rendered directly by {@link App.js}
 */
// $FlowIgnore
export default createAppContainer(RootStack);
