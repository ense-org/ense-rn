// @flow
import React, { type Node } from 'react';
import { get } from 'lodash';
import { Icon, type IconProps } from 'react-native-elements';
import { StyleSheet, View, Text } from 'react-native';
import { fontSize, halfPad, padding, quarterPad, small } from 'constants/Layout';
import Colors from 'constants/Colors';
import { asArray } from 'utils/other';

const progressHeight = 3;
const iconSize = 30;
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
  leftView?: Node,
};

const Base = ({
  durationWidth,
  leftIconProps,
  rightIconProps,
  mainContent,
  subContent,
  topTextStyle,
  bottomTextStyle,
  leftView,
}: P) => {
  const top = renderSwitch(mainContent, renderText([styles.text, topTextStyle || {}]))();
  const bottom = renderSwitch(subContent, renderText([styles.subText, bottomTextStyle || {}]))();
  const lColor = Colors.gray[get(leftIconProps, 'disabled') ? '2' : '4'];
  const rColor = Colors.gray[get(rightIconProps, 'disabled') ? '2' : '4'];
  const left = leftView || (
    <Icon
      size={iconSize}
      disabledStyle={styles.disabledButton}
      color={lColor}
      iconStyle={styles.leftBtn}
      {...leftIconProps}
    />
  );
  return (
    <View style={styles.container}>
      <View style={styles.durationBack} />
      <View style={[styles.durationFront, { width: durationWidth || 0 }]} />
      <View style={styles.contents}>
        {left}
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

const renderText = (style: ?Object | Object[]) => (content: Node) => (
  <Text numberOfLines={1} style={style ? asArray(style) : undefined}>
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

const styles = StyleSheet.create({
  container: { flexDirection: 'column' },
  contents: { flexDirection: 'row', alignItems: 'center' },
  textContainer: {
    flexDirection: 'column',
    paddingTop: halfPad,
    paddingBottom: 14,
    flex: 1,
  },
  durationBack: { height: progressHeight, backgroundColor: Colors.gray['0'] },
  durationFront: {
    marginTop: -progressHeight,
    height: progressHeight,
    backgroundColor: Colors.ense.pink,
    borderRadius: progressHeight / 2,
  },
  subTextContainer: { flexDirection: 'row', justifyContent: 'center' },
  subText: { fontSize: small, textAlign: 'center', color: Colors.gray['4'] },
  text: { fontSize: small, marginBottom: quarterPad, textAlign: 'center' },
  rightBtn: { padding: halfPad, paddingRight: padding },
  leftBtn: { padding: halfPad, paddingLeft: padding },
  disabledButton: { backgroundColor: 'transparent' },
});

Base.defaultProps = { topTextStyle: {}, bottomTextStyle: {}, leftView: null };

export default Base;
