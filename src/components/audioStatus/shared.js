// @flow
import React, { type Node } from 'react';
import { get } from 'lodash';
import { Icon, type IconProps } from 'react-native-elements';
import { StyleSheet, View, Text } from 'react-native';
import { fontSize, halfPad, padding, small } from 'constants/Layout';
import Colors from 'constants/Colors';

const progressHeight = 3;
const iconSize = 28;
export const maxMillis = 5 * 60 * 1000;

type Renderer = (Node | string) => Node;
type RenderPropProps = ({ defaultRenderer: Renderer }) => Renderer;
type Content = Node | (RenderPropProps => Node);
type P = {
  durationWidth: number,
  leftIconProps: IconProps,
  rightIconProps: IconProps,
  mainContent: Content,
  subContent: Content,
  topTextStyle?: Object,
  bottomTextStyle?: Object,
};

const renderTop = (style: ?Object) => (content: Node) => (
  <Text numberOfLines={1} style={[styles.text, style || {}]}>
    {content}
  </Text>
);

const renderBottom = (style: ?Object) => (content: Node) => (
  <Text numberOfLines={1} style={[styles.subText, style || {}]}>
    {content}
  </Text>
);

const renderSwitch = (content: Content, defaultRender: Renderer) =>
  ({
    // $FlowIgnore
    string: () => defaultRender(content),
    // $FlowIgnore
    function: () => content({ defaultRender }),
    object: () => content,
  }[typeof content]);

const Base = ({
  durationWidth,
  leftIconProps,
  rightIconProps,
  mainContent,
  subContent,
  topTextStyle,
  bottomTextStyle,
}: P) => {
  const top = renderSwitch(mainContent, renderTop(topTextStyle))();
  const bottom = renderSwitch(subContent, renderBottom(bottomTextStyle))();
  const lColor = Colors.gray[get(leftIconProps, 'disabled') ? '2' : '4'];
  const rColor = Colors.gray[get(rightIconProps, 'disabled') ? '2' : '4'];
  return (
    <View style={styles.container}>
      <View style={styles.durationBack} />
      <View style={[styles.durationFront, { width: durationWidth || 0 }]} />
      <View style={styles.contents}>
        <Icon
          size={iconSize}
          disabledStyle={styles.disabledButton}
          color={lColor}
          iconStyle={styles.leftBtn}
          {...leftIconProps}
        />
        <View style={styles.textContainer}>
          {top}
          {bottom}
        </View>
        <Icon
          size={iconSize}
          disabledStyle={styles.disabledButton}
          color={rColor}
          iconStyle={styles.rightBtn}
          {...rightIconProps}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'column' },
  contents: { flexDirection: 'row', alignItems: 'center' },
  textContainer: {
    flexDirection: 'column',
    paddingLeft: halfPad,
    paddingTop: halfPad,
    paddingBottom: padding,
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
  subTextContainer: { flexDirection: 'row', justifyContent: 'center' },
  subText: { fontSize: small, textAlign: 'center' },
  text: { fontSize, color: Colors.gray['5'], marginBottom: halfPad, textAlign: 'center' },
  rightBtn: { padding: halfPad, paddingRight: padding },
  leftBtn: { padding: halfPad, paddingLeft: padding },
  disabledButton: { backgroundColor: 'transparent' },
});

Base.defaultProps = { topTextStyle: {}, bottomTextStyle: {} };

export default Base;
