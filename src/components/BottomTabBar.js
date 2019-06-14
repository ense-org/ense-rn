// @flow
import React from 'react';
import { get } from 'lodash';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { StyleSheet, View, Text } from 'react-native';
import { BottomTabBar, type _BottomTabBarProps } from 'react-navigation';
import { fontSize, halfPad, padding, small } from 'constants/Layout';
import Colors from 'constants/Colors';
import { trunc } from 'utils/strings';
import { anonName } from 'constants/Values';
import { currentEnse as selCurrentEnse, setPaused } from 'redux/ducks/run';
import type { QueuedEnse } from 'redux/ducks/run';

type P = _BottomTabBarProps & { currentEnse: ?QueuedEnse } & { setPaused: boolean => void };
const progH = 3;
const playSize = 20;

const TabBar = (props: P) => {
  const { currentEnse, ...rest } = props;
  const Bar = <BottomTabBar {...rest} />;
  if (!currentEnse) {
    return Bar;
  }
  const { ense } = currentEnse;
  const playState = get(currentEnse, 'status.shouldPlay');
  const hasPlayState = typeof playState === 'boolean';
  const [iconName, iconType] =
    hasPlayState && playState ? ['pause', 'material'] : ['caretright', 'antdesign'];
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
          name={iconName}
          type={iconType}
          iconStyle={styles.playBtn}
          color={Colors.gray['5']}
          disabled={!hasPlayState}
          onPress={() => {
            console.log('pause', hasPlayState, playState);
            if (hasPlayState) {
              props.setPaused(playState);
            }
          }}
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

const select = s => ({ currentEnse: selCurrentEnse(s) });
const dispatch = d => ({ setPaused: p => d(setPaused(p)) });
export default connect<P, *, *, *, *, *>(
  select,
  dispatch
)(TabBar);
