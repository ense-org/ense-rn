import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Some default metrics
export const small = 12;
export const regular = 16;
export const large = 24;
export const xlarge = 32;

export const padding = 16;
export const paddingBottom = padding;
export const paddingTop = padding;
export const paddingRight = padding;
export const paddingLeft = padding;
export const paddingHorizontal = padding;
export const paddingVertical = padding;

export const margin = padding;
export const marginBottom = margin;
export const marginTop = margin;
export const marginRight = margin;
export const marginLeft = margin;
export const marginHorizontal = padding;
export const marginVertical = padding;

export const halfPad = padding / 2;
export const quarterPad = halfPad / 2;
export const largePad = padding * 1.5;
export const doublePad = padding * 2;
export const triplePad = padding * 3;

export const fontSize = 14;
export const largeFont = 18;

export const deviceW = width;
export const deviceH = height;

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
};
