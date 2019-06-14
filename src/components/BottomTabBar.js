// @flow
import React from 'react';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { StyleSheet, View, Text } from 'react-native';
import { BottomTabBar, type _BottomTabBarProps } from 'react-navigation';
import { enseSelector } from 'redux/ducks/player';
import Ense from 'models/Ense';
import { fontSize, halfPad, padding, small } from 'constants/Layout';
import Colors from 'constants/Colors';
import { trunc } from 'utils/strings';
import { anonName } from 'constants/Values';

type P = _BottomTabBarProps & { ense: ?Ense };
const progH = 3;
const playSize = 20;

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
        <View style={styles.enseInfo}>
          <Text numberOfLines={1} style={styles.text}>
            {ense.title}
          </Text>
          <View style={styles.nameContainer}>
            <Text numberOfLines={1} style={styles.username}>
              {trunc(ense.username || anonName, 25)}
            </Text>
            <Text numberOfLines={1} style={styles.handle}>
              @{ense.userhandle}
            </Text>
          </View>
        </View>
        <Icon
          size={playSize}
          name="caretright"
          type="antdesign"
          iconStyle={styles.playBtn}
          color={Colors.gray['5']}
          onPress={() => console.log('hello')}
        />
      </View>
      {Bar}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'column' },
  player: { flexDirection: 'row', alignItems: 'center' },
  enseInfo: {
    flexDirection: 'column',
    paddingLeft: halfPad,
    paddingTop: halfPad,
    paddingBottom: halfPad,
    flex: 1,
  },
  durationBack: { height: progH, backgroundColor: Colors.gray['0'] },
  durationFront: {
    marginTop: -progH,
    height: progH,
    backgroundColor: Colors.ense.pink,
    width: 0,
    borderRadius: progH / 2,
  },
  username: { fontSize: small, paddingRight: 5, color: Colors.ense.black, fontWeight: 'bold' },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: padding + playSize + halfPad,
  },
  handle: { fontSize: small, color: Colors.text.secondary, textAlign: 'center' },
  text: {
    fontSize,
    color: Colors.gray['5'],
    marginBottom: halfPad,
    textAlign: 'center',
  },
  playBtn: { padding: halfPad, paddingRight: padding },
});

const select = s => ({ ense: enseSelector(s) });
export default connect(select)(TabBar);
