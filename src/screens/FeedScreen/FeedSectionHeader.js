// @flow
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { titleText } from 'constants/Styles';
import { halfPad, paddingHorizontal } from 'constants/Layout';
import Colors from 'constants/Colors';

type P = {
  title: string,
};
export default ({ title }: P) => (
  <View style={styles.sectionHeaderContainer}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    backgroundColor: Colors.gray['0'],
    paddingVertical: halfPad,
    paddingHorizontal,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.gray['0'],
  },
  sectionHeaderText: {
    ...titleText,
  },
});
