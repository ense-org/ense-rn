// @flow

// Level 3
export const profileStack = {
  key: 'ProfileStack',
  myProfile: { key: 'MyProfileScreen' },
};

export const authStack = {
  key: 'AuthStack',
  signIn: { key: 'SignInScreen' },
};

// Level 2
export const userTab = {
  key: 'UserNavigator',
  sessionSwitch: { key: 'SessionSwitcher' },
  profileStack,
  authStack,
};
export const feedTab = {
  key: 'FeedStack',
  home: { key: 'FeedScreen' },
};
export const settingsTab = { key: 'SettingsStack' };
export const notificationsTab = { key: 'NotificationsStack' };

// Level 1
export const tabs = {
  key: 'Tabs',
  feedTab,
  userTab,
  settingsTab,
  notificationsTab,
};

export const deviceKeySwitch = { key: 'DeviceKeySwitcher' };

// Level 0
export default {
  deviceKeySwitch,
  tabs,
};
