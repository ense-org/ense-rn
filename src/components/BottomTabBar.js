// @flow
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { StyleSheet, View, Text } from 'react-native';
import { BottomTabBar } from 'react-navigation';
import { enseSelector } from 'redux/ducks/player';

type P = {};

const TabBar = (props: P) => {
  const title = get(props, 'ense.title');
  return (
    <View style={styles.container}>
      {title && <Text>{title}</Text>}
      <BottomTabBar {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
});

const select = s => ({ ense: enseSelector(s) });
export default connect(select)(TabBar);
