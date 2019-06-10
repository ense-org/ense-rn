// @flow

// Level 3
export const profileStack = {
  key: 'ProfileStack',
  profilePage: { key: 'ProfileScreen' },
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

// Level 1
export const tabs = {
  key: 'Tabs',
  feedTab,
  userTab,
  settingsTab,
};

export const deviceKeySwitch = { key: 'DeviceKeySwitcher' };

// Level 0
export default {
  deviceKeySwitch,
  tabs,
};
