// @flow

// Level 3
export const accountsList = { key: 'AccountsList' };
export const enseUrlList = { key: 'EnseUrlScreen' };
export const pubProfile = { key: 'PublicProfile' };

// All pages you can get to from an ense item, recursive
const fromEnse = { pubProfile, enseUrlList, accountsList };

export const profileStack = {
  key: 'ProfileStack',
  myProfile: { key: 'MyProfileScreen' },
  ...fromEnse,
};

export const authStack = {
  key: 'AuthStack',
  signIn: { key: 'SignInScreen' },
};

// Level 2
export const userTab = {
  key: 'UserNavigator',
  sessionSwitch: { key: 'SessionSwitcher' },
  authStack,
  profileStack,
};

export const feedTab = {
  key: 'FeedStack',
  home: { key: 'FeedScreen' },
  ...fromEnse,
};

export const mentionsTab = {
  key: 'MentionsStack',
  myMentions: { key: 'MyMentions' },
  ...fromEnse,
};

export const searchTab = {
  key: 'SearchStack',
  main: { key: 'SearchScreen' },
  ...fromEnse,
};

// Level 1
export const tabs = {
  key: 'Tabs',
  feedTab,
  userTab,
  mentionsTab,
  searchTab,
};

export const deviceKeySwitch = { key: 'DeviceKeySwitcher' };

// Level 0
export default {
  deviceKeySwitch,
  tabs,
};

// Level -1
export const root = {
  main: { key: 'Main' },
  postEnseModal: { key: 'PostEnse' },
  fullPlayer: { key: 'FullPlayer' },
  editProfile: { key: 'EditProfile' },
};
