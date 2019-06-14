const gray = {
  0: '#f1f1f1',
  1: '#e7e7e7',
  2: '#cecece',
  3: '#a0a0a0',
  4: '#515151',
  5: '#373737',
  transparent: 'rgba(189,187,192, 0.9)',
};

const ense = {
  black: '#191003',
  blue: '#28395f',
  actionblue: '#31a9e4',
  orange: '#E89348',
  midnight: '#3B3447',
  white: '#FFFFFF',
  pink: '#fd579a',
  pinkfaded: 'rgba(253, 87, 154, 0.2)',
  lightpink: '#ffdcec',
  gold: '#8b6221',
  lightblue: 'dodgerblue',
  paleblue: '#f5f9ff',
  green: '#63bd00',
  beige: '#8a7965',
  maroon: '#c70058',
  darkbrown: '#443623',
  yellow: '#ffdd00',
};

const tintColor = ense.pink;

export default {
  tintColor,
  tabIconDefault: gray['2'],
  tabIconSelected: gray['5'],
  tabBar: gray['0'],
  errorBackground: 'red',
  errorText: 'white',
  warningBackground: ense.yellow,
  warningText: ense.beige,
  noticeBackground: tintColor,
  noticeText: 'white',
  gray,
  ense,
  text: {
    main: ense.black,
    secondary: gray['4'],
    action: gray['4'],
  },
};
