// @flow
import React from 'react';
import BottomTabBar, { type BottomTabBarProps } from 'components/vendor/BottomTabBar';
import RecordButton from 'components/RecordButton';
import PlayerBar from 'components/audioStatus/PlayerBar';
import RecorderBar from 'components/audioStatus/RecorderBar';

type P = BottomTabBarProps;

export default (props: P) => {
  return (
    <>
      <PlayerBar />
      <RecorderBar />
      <BottomTabBar {...props} centerView={<RecordButton key="record-button" />} />
    </>
  );
};
