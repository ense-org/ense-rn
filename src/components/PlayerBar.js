// @flow
import React from 'react';
import { get } from 'lodash';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { StyleSheet, View, Text } from 'react-native';
import layout, { fontSize, halfPad, padding, small } from 'constants/Layout';
import Colors from 'constants/Colors';
import { trunc } from 'utils/strings';
import { anonName } from 'constants/Values';
import { currentEnse as selCurrentEnse, setPaused } from 'redux/ducks/run';
import type { QueuedEnse } from 'redux/ducks/run';

type SP = { currentEnse: ?QueuedEnse };
type DP = { setPaused: boolean => void };
type P = SP & DP;

const progressHeight = 3;
const playSize = 32;

const EnseBottomTabBar = (props: P) => {
  const { currentEnse } = props;
  if (!currentEnse) {
    return null;
  }
  const { ense } = currentEnse;
  const status = get(currentEnse, 'status');
  const playState = get(status, 'shouldPlay');
  const hasPlayState = typeof playState === 'boolean';
  const [iconName, iconType] =
    !hasPlayState || playState
      ? ['pause-circle-outline', 'material']
      : ['play-circle-outline', 'material'];
  const disabled = !hasPlayState;
  const width =
    (status ? (status.positionMillis / status.durationMillis) * layout.window.width : 0) || 0;
  const onPress = () => {
    if (hasPlayState) {
      props.setPaused(playState);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.durationBack} />
      <View style={[styles.durationFront, { width }]} />
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
          color={disabled ? Colors.gray['3'] : Colors.gray['4']}
          disabled={disabled}
          disabledStyle={styles.disabledButton}
          onPress={onPress}
        />
      </View>
    </View>
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
  durationBack: { height: progressHeight, backgroundColor: Colors.gray['0'] },
  durationFront: {
    marginTop: -progressHeight,
    height: progressHeight,
    backgroundColor: Colors.ense.pink,
    borderRadius: progressHeight / 2,
  },
  username: { fontSize: small, paddingRight: 5, color: Colors.ense.black, fontWeight: 'bold' },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: padding + playSize + halfPad,
  },
  handle: { fontSize: small, color: Colors.text.secondary, textAlign: 'center' },
  text: { fontSize, color: Colors.gray['5'], marginBottom: halfPad, textAlign: 'center' },
  playBtn: { padding: halfPad, paddingRight: padding },
  disabledButton: { backgroundColor: 'transparent' },
});

const select = s => ({ currentEnse: selCurrentEnse(s) });
const dispatch = d => ({ setPaused: p => d(setPaused(p)) });
export default connect<P, *, *, *, *, *>(
  select,
  dispatch
)(EnseBottomTabBar);
