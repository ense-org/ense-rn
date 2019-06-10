// @flow
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { get } from 'lodash';
import Button from 'components/Button';
import type { ButtonProps } from 'components/Button';
import { fontSize, regular } from 'constants/Layout';
import Colors from 'constants/Colors';

/**
 * Primary Ense buttons
 */

export const MainButton = (p: ButtonProps) => (
  <Button
    {...p}
    style={[styles.main.style, ..._getSpread(p, 'style')]}
    textStyle={[styles.main.textStyle, ..._getSpread(p, 'textStyle')]}
    disabledStyle={[styles.main.disabledStyle, ..._getSpread(p, 'disabledStyle')]}
    disabledTextStyle={[styles.main.disabledTextStyle, ..._getSpread(p, 'disabledTextStyle')]}
  />
);

export const SecondaryButton = (p: ButtonProps) => (
  <Button
    {...p}
    style={[styles.secondary.style, ..._getSpread(p, 'style')]}
    textStyle={[styles.secondary.textStyle, ..._getSpread(p, 'textStyle')]}
    disabledStyle={[styles.secondary.disabledStyle, ..._getSpread(p, 'disabledStyle')]}
    disabledTextStyle={[styles.secondary.disabledTextStyle, ..._getSpread(p, 'disabledTextStyle')]}
  />
);

const _getSpread = (p: ButtonProps, k: string) => {
  const v = get(p, k, []);
  return Array.isArray(v) ? v : [v];
};

const styles = {
  main: StyleSheet.create({
    style: {
      backgroundColor: Colors.ense.pink,
    },
    textStyle: {
      color: 'white',
      fontSize: regular,
    },
    disabledStyle: {
      backgroundColor: 'white',
    },
    disabledTextStyle: {
      color: Colors.gray['2'],
    },
  }),
  secondary: StyleSheet.create({
    style: {
      backgroundColor: 'transparent',
    },
    textStyle: {
      color: Colors.ense.pink,
      fontSize,
    },
    disabledStyle: {
      backgroundColor: 'white',
    },
    disabledTextStyle: {
      color: Colors.gray['2'],
    },
  }),
};
