// @flow
import React from 'react';
import BottomTabBar, { type BottomTabBarProps } from 'components/vendor/BottomTabBar';
import RecordButton from 'components/RecordButton';
import PlayerBar from 'components/PlayerBar';

type P = BottomTabBarProps;

export default (props: P) => {
  return (
    <>
      <PlayerBar />
      <BottomTabBar {...props} centerView={<RecordButton key="record-button" />} />
    </>
  );
};
