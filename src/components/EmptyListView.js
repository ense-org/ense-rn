// @flow
import * as React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { padding } from 'constants/Layout';

export default () => (
  <View style={styles.empty}>
    <ActivityIndicator />
  </View>
);

const styles = StyleSheet.create({
  empty: { flexDirection: 'row', justifyContent: 'center', padding },
});
