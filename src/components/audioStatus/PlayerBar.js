// @flow
import React, { useState } from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image } from 'react-native';
import layout, { halfPad, small } from 'constants/Layout';
import Colors from 'constants/Colors';
import { emptyProfPicUrl } from 'constants/Values';
import { currentEnse as selCurrentEnse, setCurrentPaused } from 'redux/ducks/run';
import type { QueuedEnse } from 'redux/ducks/run';

import StatusBar from './shared';

type SP = {| currentEnse: ?QueuedEnse |};
type DP = {| setPaused: boolean => void |};
type P = {| ...SP, ...DP |};

const leftIcon = { name: 'chevron-up', type: 'feather', color: Colors.gray['1'] };
const rightIcon = (paused: boolean) =>
  paused ? ['pause-circle', 'feather'] : ['play-circle', 'feather'];

const PlayerBar = (props: P) => {
  const { currentEnse } = props;
  const [imgW, setImgW] = useState(0);
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
  const left = (
    <Image
      onLayout={e => setImgW(e.nativeEvent.layout.height)}
      source={{ uri: ense.profpic || emptyProfPicUrl }}
      style={[styles.img, { width: imgW }]}
      resizeMode="cover"
    />
  );

  return (
    <StatusBar
      durationWidth={width}
      leftIconProps={leftIcon}
      rightIconProps={{ onPress, name, type, disabled: !hasPlayState }}
      mainContent={ense.title}
      leftView={left}
      bottomTextStyle={styles.handle}
      subContent={({ defaultRender }: any) => (
        <View style={styles.subTextContainer}>
          <Text numberOfLines={1} style={styles.username}>
            {ense.nameFitted()}
          </Text>
          {defaultRender(handle ? `@${handle}` : '~anonymous~')}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  username: { fontSize: small, paddingRight: 6, fontWeight: 'bold' },
  subTextContainer: { flexDirection: 'row', justifyContent: 'center' },
  handle: { color: Colors.gray['4'] },
  img: {
    backgroundColor: Colors.gray['0'],
    alignSelf: 'stretch',
    minWidth: 60,
    marginRight: halfPad,
  },
});

export default connect<P, *, *, *, *, *>(
  s => ({ currentEnse: selCurrentEnse(s) }),
  d => ({ setPaused: p => d(setCurrentPaused(p)) })
)(PlayerBar);
