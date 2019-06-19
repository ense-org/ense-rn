// @flow
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { get } from 'lodash';
import Button from 'components/Button';
import type { ButtonProps } from 'components/Button';
import { fontSize, regular } from 'constants/Layout';
import Colors from 'constants/Colors';
import { asArray } from 'utils/other';

const _getSpread = (p: ButtonProps, k: string) => asArray(get(p, k, []));

const _fromStyles = (btnStyle: Object) => (p: ButtonProps) => (
  <Button
    {...p}
    style={[btnStyle.style, ..._getSpread(p, 'style')]}
    textStyle={[btnStyle.textStyle, ..._getSpread(p, 'textStyle')]}
    disabledStyle={[btnStyle.disabledStyle, ..._getSpread(p, 'disabledStyle')]}
    disabledTextStyle={[btnStyle.disabledTextStyle, ..._getSpread(p, 'disabledTextStyle')]}
  />
);

const styles = {
  main: StyleSheet.create({
    style: { backgroundColor: Colors.ense.pink },
    textStyle: { color: 'white', fontSize: regular },
    disabledStyle: { backgroundColor: Colors.ense.pinkfaded },
    disabledTextStyle: { color: Colors.gray['0'] },
  }),
  secondary: StyleSheet.create({
    style: { backgroundColor: 'transparent', borderRadius: 0 },
    textStyle: { color: Colors.ense.pink, fontSize },
    disabledStyle: { backgroundColor: 'white' },
    disabledTextStyle: { color: Colors.gray['2'] },
  }),
};

/**
 * Primary Ense buttons
 */

export const MainButton = _fromStyles(styles.main);
export const SecondaryButton = _fromStyles(styles.secondary);
