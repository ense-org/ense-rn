// @flow
import { fontSize, largeFont } from 'constants/Layout';
import colors from 'constants/Colors';

export const defaultText = {
  fontSize,
  color: colors.text.main,
};

export const largeText = {
  fontSize: largeFont,
};

export const smallText = {
  fontSize: 10,
};

export const titleText = {
  ...largeText,
  fontWeight: 'bold',
};

export const subText = {
  fontSize,
  color: colors.text.secondary,
};

export const actionText = {
  fontSize,
  color: colors.text.action,
};

export const linkedText = {
  fontSize,
  color: colors.ense.actionblue,
};
