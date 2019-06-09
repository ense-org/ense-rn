const tintColor = '#2f95dc';

export const gray = {
  0: '#f1f1f1',
  1: '#e7e7e7',
  2: '#cecece',
  3: '#a0a0a0',
  4: '#515151',
  5: '#171717',
};

export default {
  tintColor,
  tabIconDefault: '#ccc',
  tabIconSelected: tintColor,
  tabBar: '#fefefe',
  errorBackground: 'red',
  errorText: '#fff',
  warningBackground: '#EAEB5E',
  warningText: '#666804',
  noticeBackground: tintColor,
  noticeText: '#fff',
  gray,
  text: {
    main: 'black',
    secondary: gray['3'],
    action: gray['4'],
  },
};
