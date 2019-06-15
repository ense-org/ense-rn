// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import Colors from 'constants/Colors';
import { recordNew } from 'redux/ducks/run';

type DP = { recordNew: () => void };
type P = DP;
const Btn = (p: P) => {
  return (
    <Icon
      name="microphone"
      type="font-awesome"
      size={24}
      reverse
      color={Colors.ense.pink}
      onPress={p.recordNew}
    />
  );
};

const dispatch = d => ({
  recordNew: () => d(recordNew),
});
export default connect<P, *, *, *, *, *>(
  null,
  dispatch
)(Btn);
