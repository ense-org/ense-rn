// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { Image, Linking, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import {
  halfPad,
  hitSlop,
  large,
  padding,
  paddingBottom,
  quarterPad,
  regular,
  small,
} from 'constants/Layout';
import Ense from 'models/Ense';
import { actionText, defaultText, linkedText, subText } from 'constants/Styles';
import { emptyProfPicUrl } from 'constants/Values';
import Colors from 'constants/Colors';
import { playSingle, recordStatus as _recordStatus } from 'redux/ducks/run';
import type { NLP } from 'utils/types';
import { pubProfile, topicEnses } from 'navigation/keys';
import { RecordingStatus } from 'expo-av/build/Audio/Recording';
import { $get } from 'utils/api';
import routes from 'utils/api/routes';
import PublicAccount from 'models/PublicAccount';
import ParsedText from 'components/ParsedText';
import { ListensOverlay, ReactionsOverlay } from 'components/Overlays';
import type { ListensPayload } from 'utils/api/types';
import { renderShortUrl, truncEmoji } from 'utils/strings';
import { asArray } from 'utils/other';

type DP = {| updatePlaying: Ense => void |};
type OP = {| ense: Ense, isPlaying: boolean |};
type SP = {| recordStatus: ?RecordingStatus |};
type P = {| ...DP, ...OP, ...NLP<any>, ...SP |};
type S = {|
  listeners: PublicAccount[],
  showListeners: boolean,
  reactions: PublicAccount[],
  showReactions: boolean,
|};

const imgSize = 40;

class FeedItem extends React.Component<P, S> {
  state = { showListeners: false, listeners: [], showReactions: false, reactions: [] };
  _statusInfo = () => {
    const { ense } = this.props;
    return ense.likeCount ? (
      <TouchableHighlight
        onPress={this._showReactions}
        underlayColor="transparent"
        hitSlop={hitSlop}
      >
        <View style={styles.horizontalTxt}>
          <Text style={styles.detailInfo}>{truncEmoji(ense.likeTypes, 4)}</Text>
          <Text style={actionText}>{ense.likeCount}</Text>
        </View>
      </TouchableHighlight>
    ) : null;
  };

  _onPress = () => {
    const { recordStatus, ense, updatePlaying } = this.props;
    // TODO pause current ense
    !recordStatus && updatePlaying(ense);
  };

  _nowPlaying = () => {
    return (
      <View style={styles.nowPlaying}>
        <Icon
          iconStyle={styles.txtIcon}
          size={small}
          name="play-circle"
          type="font-awesome"
          color={Colors.ense.pink}
          disabledStyle={styles.disabledButton}
        />
        <Text style={[subText, styles.nowPlayingTxt]}>Playing</Text>
      </View>
    );
  };

  _inToken = (node: React.Node, style?: Object = { marginRight: regular }) => (
    <View style={[styles.horizontalTxt, styles.token, ...asArray(style || {})]}>{node}</View>
  );

  _reactions = (ense: Ense) =>
    ense.likeCount ? (
      <TouchableHighlight
        onPress={this._showReactions}
        underlayColor="transparent"
        hitSlop={hitSlop}
      >
        {this._inToken(
          <>
            <Text style={styles.detailInfo}>{truncEmoji(ense.likeTypes, 3)}</Text>
            <Text style={actionText}>{ense.likeCount}</Text>
          </>
        )}
      </TouchableHighlight>
    ) : null;

  _privacy = (ense: Ense) =>
    ense.unlisted
      ? this._inToken(<Text style={[styles.heavyTokenTxt, styles.private]}>Private</Text>, [
          styles.heavyToken,
          styles.rightToken,
        ])
      : null;

  _exclusive = (ense: Ense) =>
    ense.isExclusive
      ? this._inToken(<Text style={[styles.heavyTokenTxt, styles.exclusive]}>Exclusive</Text>, [
          styles.heavyToken,
          styles.rightToken,
          styles.exclToken,
        ])
      : null;

  _listens = (ense: Ense) =>
    ense.playcount ? (
      <TouchableHighlight
        onPress={this._showListeners}
        underlayColor="transparent"
        hitSlop={hitSlop}
      >
        {this._inToken(
          <>
            {/*<Icon*/}
            {/*  iconStyle={styles.txtIcon}*/}
            {/*  size={13}*/}
            {/*  name="headphones"*/}
            {/*  type="feather"*/}
            {/*  color={Colors.gray['4']}*/}
            {/*  disabledStyle={styles.disabledButton}*/}
            {/*/>*/}
            <Text style={[actionText, styles.playcount]}>🎧 {ense.playCountStr()}</Text>
          </>
        )}
      </TouchableHighlight>
    ) : null;

  _bottomRow = () => {
    const { ense } = this.props;
    return (
      <>
        {this._listens(ense)}
        {this._reactions(ense)}
        <View style={{ flex: 1 }} />
        {this._privacy(ense)}
        {this._exclusive(ense)}
      </>
    );
  };

  _topRight = () => {
    const { ense, isPlaying } = this.props;
    if (isPlaying) {
      return this._nowPlaying();
    }
    return <Text style={subText}>{ense.durationString()}</Text>;
  };

  _goToProfile = () => {
    // TODO prevent going to current profile or double tapping via a disable state
    const {
      ense: { userhandle, userKey },
      navigation: { push },
    } = this.props;
    if (!(userhandle || userKey) || !push) {
      return;
    }
    push(pubProfile.key, { userHandle: userhandle, userId: userKey });
  };

  _showListeners = () => {
    const { ense } = this.props;
    // TODO cache maybe
    $get(routes.listenersOf(ense.handle, ense.key)).then((list: ListensPayload) => {
      this.setState({ listeners: list.map(([_, a]) => PublicAccount.parse(a)) });
    });
    ense.playcount && this.setState({ showListeners: true });
  };

  _showReactions = () => {
    const { ense } = this.props;
    $get(routes.reactionsFor(ense.handle, ense.key)).then((list: ListensPayload) => {
      this.setState({ reactions: list.map(([_, a]) => PublicAccount.parse(a)) });
    });
    ense.likeCount && this.setState({ showReactions: true });
  };

  _closeListens = () => this.setState({ showListeners: false });
  _closeReactions = () => this.setState({ showReactions: false });

  _onUrl = url => Linking.openURL(url);
  _onHandle = (atHandle: string) => {
    const {
      navigation: { push },
    } = this.props;
    if (!atHandle || !push) {
      return;
    }
    const userHandle = atHandle.replace(/^@/, '');
    push(pubProfile.key, { userHandle });
  };

  _onTopic = (hashTopic: string) => {
    const {
      navigation: { push },
    } = this.props;
    if (!hashTopic || !push) {
      return;
    }
    const topic = hashTopic.replace(/^#/, '');
    push(topicEnses.key, { topic });
  };

  _parseText = () => [
    {
      type: 'url',
      style: linkedText,
      onPress: this._onUrl,
      renderText: renderShortUrl,
    },
    { pattern: /#([\w-_]+)/, style: linkedText, onPress: this._onTopic },
    { pattern: /@([\w-_]+)/, style: linkedText, onPress: this._onHandle },
  ];

  render() {
    const { ense } = this.props;
    const { listeners, showListeners, reactions, showReactions } = this.state;
    return (
      <>
        <TouchableHighlight onPress={this._onPress} underlayColor={Colors.gray['1']}>
          <View style={styles.container}>
            <View style={styles.imgCol}>
              <TouchableHighlight onPress={this._goToProfile}>
                <Image
                  source={{ uri: ense.profpic || emptyProfPicUrl }}
                  style={styles.img}
                  resizeMode="cover"
                />
              </TouchableHighlight>
            </View>
            <View style={styles.enseBody}>
              <View style={styles.detailRow}>
                <TouchableHighlight
                  onPress={this._goToProfile}
                  underlayColor={Colors.gray['1']}
                  hitSlop={hitSlop}
                >
                  <View style={styles.nameHandle}>
                    <Text style={styles.username} numberOfLines={1}>
                      {ense.nameFitted()}
                    </Text>
                    <Text style={styles.handle} numberOfLines={1}>
                      @{ense.userhandle}
                    </Text>
                  </View>
                </TouchableHighlight>
                <View style={{ flex: 1 }} />
                {this._topRight()}
              </View>
              <Text style={styles.timeAgo}>{ense.agoString()}</Text>
              <ParsedText style={styles.enseContent} parse={this._parseText()}>
                {ense.title}
              </ParsedText>
              <View style={styles.summaryRow}>{this._bottomRow()}</View>
            </View>
          </View>
        </TouchableHighlight>
        <ListensOverlay visible={showListeners} accounts={listeners} close={this._closeListens} />
        <ReactionsOverlay
          visible={showReactions}
          accounts={reactions}
          close={this._closeReactions}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.gray['1'],
  },
  enseBody: { flexDirection: 'column', flex: 1 },
  nameHandle: { flexDirection: 'row' },
  horizontalTxt: { flexDirection: 'row', alignItems: 'center' },
  img: { width: imgSize, height: imgSize, backgroundColor: Colors.gray['1'] },
  username: {
    ...subText,
    paddingRight: 5,
    color: Colors.ense.black,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  summaryRow: { flexDirection: 'row', marginTop: padding, alignItems: 'center', opacity: 0.8 },
  timeAgo: { fontSize: small, color: Colors.gray['3'], paddingTop: quarterPad },
  handle: { ...subText, flexShrink: 1, minWidth: 20 },
  detailInfo: { ...subText, paddingRight: quarterPad, letterSpacing: -3 },
  imgCol: { paddingTop: 2, paddingBottom, marginRight: halfPad },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  enseContent: { ...defaultText, paddingVertical: halfPad },
  nowPlaying: { flexDirection: 'row', alignItems: 'center' },
  txtIcon: { paddingRight: quarterPad },
  nowPlayingTxt: { ...subText, color: Colors.ense.pink },
  token: { paddingVertical: 3 },
  playcount: {},
  rightToken: { marginRight: 0 },
  heavyToken: {
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray['3'],
  },
  exclToken: { borderColor: Colors.ense.gold },
  heavyTokenTxt: { textTransform: 'uppercase', fontWeight: 'bold', fontSize: small },
  private: { color: Colors.gray['3'] },
  exclusive: { color: Colors.ense.gold },
});

const WithNav = withNavigation(FeedItem);
// $FlowFixMe
export default connect<P, OP, SP, DP, *, *>(
  (s): SP => ({ recordStatus: _recordStatus(s) }),
  (d): DP => ({ updatePlaying: (e: Ense) => d(playSingle(e)) })
  // $FlowFixMe
)(WithNav);
