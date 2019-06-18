// @flow
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { StyleSheet, View, Text } from 'react-native';
import layout, { small } from 'constants/Layout';
import Colors from 'constants/Colors';
import { trunc } from 'utils/strings';
import { anonName } from 'constants/Values';
import { currentEnse as selCurrentEnse, setPaused } from 'redux/ducks/run';
import type { QueuedEnse } from 'redux/ducks/run';

import StatusBar from './shared';

type SP = {| currentEnse: ?QueuedEnse |};
type DP = {| setPaused: boolean => void |};
type P = {| ...SP, ...DP |};

const leftIcon = { name: 'chevron-up', type: 'feather', color: Colors.gray['1'] };
const rightIcon = (paused: boolean) =>
  paused ? ['pause-circle', 'feather'] : ['play-circle-outline', 'material'];

const PlayerBar = (props: P) => {
  const { currentEnse } = props;
  if (!currentEnse) {
    return null;
  }
  const { ense, status } = currentEnse;
  const handle = get(ense, 'userhandle');
  const shouldPlay = get(status, 'shouldPlay');
  const hasPlayState = typeof shouldPlay === 'boolean';
  const [name, type] = rightIcon(!hasPlayState || shouldPlay);
  const onPress = () => hasPlayState && props.setPaused(shouldPlay);
  const width = status ? (status.positionMillis / status.durationMillis) * layout.window.width : 0;

  return (
    <StatusBar
      durationWidth={width}
      leftIconProps={leftIcon}
      rightIconProps={{ onPress, name, type, disabled: !hasPlayState }}
      mainContent={ense.title}
      subContent={({ defaultRender }: any) => (
        <View style={styles.subTextContainer}>
          <Text numberOfLines={1} style={styles.username}>
            {trunc(ense.username || anonName, 25)}
          </Text>
          {defaultRender(handle ? `@${handle}` : '~anonymous~')}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  username: { fontSize: small, paddingRight: 5, color: Colors.ense.black, fontWeight: 'bold' },
  subTextContainer: { flexDirection: 'row', justifyContent: 'center' },
});

export default connect<P, *, *, *, *, *>(
  s => ({ currentEnse: selCurrentEnse(s) }),
  d => ({ setPaused: p => d(setPaused(p)) })
)(PlayerBar);
