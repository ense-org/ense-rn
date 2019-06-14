// @flow
import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text } from 'react-native';
import { BottomTabBar, type _BottomTabBarProps } from 'react-navigation';
import { enseSelector } from 'redux/ducks/player';
import Ense from 'models/Ense';
import { fontSize, halfPad, padding } from 'constants/Layout';
import Colors from 'constants/Colors';
import { subText } from 'constants/Styles';

type P = _BottomTabBarProps & { ense: ?Ense };
const progH = 3;

const TabBar = (props: P) => {
  const { ense, ...rest } = props;
  const Bar = <BottomTabBar {...rest} />;
  if (!ense) {
    return Bar;
  }
  return (
    <>
      <View style={styles.durationBack} />
      <View style={styles.durationFront} />
      <View style={styles.player}>
        <Text numberOfLines={1} style={[styles.text, styles.handle]}>
          @{ense.userhandle}
        </Text>
        <Text numberOfLines={2} style={styles.text}>
          {ense.title}
        </Text>
      </View>
      {Bar}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'column' },
  player: { flexDirection: 'column', padding },
  durationBack: { height: progH, backgroundColor: Colors.gray['1'] },
  durationFront: {
    marginTop: -progH,
    height: progH,
    backgroundColor: Colors.ense.pink,
    width: 0,
    borderRadius: progH / 2,
  },
  handle: { fontWeight: 'bold', marginBottom: halfPad, color: Colors.ense.black },
  text: { ...subText },
});

const select = s => ({ ense: enseSelector(s) });
export default connect(select)(TabBar);
