// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { Image, Linking, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import {
  halfPad,
  hitSlop,
  largeFont,
  marginHorizontal,
  marginLeft,
  marginVertical,
  padding,
  paddingBottom,
  quarterPad,
  regular,
  small,
} from 'constants/Layout';
import Ense from 'models/Ense';
import { actionText, defaultText, largeText, linkedText, subText } from 'constants/Styles';
import { emptyProfPicUrl } from 'constants/Values';
import Colors from 'constants/Colors';
import { playSingle, recordStatus as _recordStatus } from 'redux/ducks/run';
import type { NLP } from 'utils/types';
import { pubProfile, enseUrlList } from 'navigation/keys';
import { RecordingStatus } from 'expo-av/build/Audio/Recording';
import { $get } from 'utils/api';
import routes from 'utils/api/routes';
import PublicAccount from 'models/PublicAccount';
import ParsedText from 'components/ParsedText';
import { ListensOverlay, ReactionsOverlay } from 'components/Overlays';
import type { ListensPayload } from 'utils/api/types';
import { renderShortUrl } from 'utils/strings';
import { asArray } from 'utils/other';
import type { EnseUrlScreenParams as EUSP } from 'screens/EnseUrlScreen';
import { limit } from 'stringz';
import Spacer from 'components/Spacer';

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

class ExpandedFeedItem extends React.Component<P, S> {
  state = { showListeners: false, listeners: [], showReactions: false, reactions: [] };

  _onPress = () => {
    const { recordStatus, ense, updatePlaying } = this.props;
    // TODO pause current ense
    !recordStatus && updatePlaying(ense);
  };

  _nowPlaying = () => (
    <View style={styles.nowPlaying}>
      <Icon
        iconStyle={styles.playingIcon}
        size={small}
        name="play-circle"
        type="font-awesome"
        color={Colors.ense.pink}
      />
      <Text style={[subText, styles.nowPlayingTxt]}>Playing</Text>
    </View>
  );

  _inToken = (node: React.Node, style?: Object = { marginRight: regular }) => (
    <View style={[styles.row, styles.token, ...asArray(style || {})]}>{node}</View>
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
            <Text style={styles.detailText}>{ense.likeCount}</Text>
            <Text style={styles.detailInfo}>Reaction{ense.likeCount > 1 ? 's' : ''}</Text>
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
            <Text style={styles.detailText}>{ense.playcount}</Text>
            <Text style={styles.detailInfo}>Listen{ense.playcount > 1 ? 's' : ''}</Text>
          </>
        )}
      </TouchableHighlight>
    ) : null;

  _statsRow = () => {
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

  // TODO
  _noop = () => {};

  _actionsRow = () => {
    const { ense } = this.props;
    return (
      <>
        <Icon
          iconStyle={styles.txtIcon}
          onPress={this._noop}
          size={largeFont}
          type="feather"
          name="message-circle"
          color={Colors.gray['4']}
        />
        <Icon
          iconStyle={styles.txtIcon}
          onPress={this._noop}
          size={largeFont}
          type="feather"
          name="heart"
          color={Colors.gray['4']}
        />
        <Icon
          iconStyle={styles.txtIcon}
          onPress={this._noop}
          size={largeFont}
          type="feather"
          name="share"
          color={Colors.gray['4']}
        />
        <Icon
          iconStyle={styles.txtIcon}
          onPress={this._noop}
          size={largeFont}
          type="feather"
          name="more-horizontal"
          color={Colors.gray['4']}
        />
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

  _onTopic = (tag: string) => {
    this._pushEnseScreen({ title: tag, url: routes.topic(tag.replace(/^#/, '')) });
  };

  _onConvo = () => {
    const { ense } = this.props;
    const url = routes.convoFor(ense.handle, ense.key);
    this._pushEnseScreen({ title: 'Thread', url, reverse: true, highlight: [ense.key] });
  };

  _pushEnseScreen = (params: EUSP) => {
    const { navigation } = this.props;
    // $FlowIgnore - we can do better nav typing eventually
    typeof navigation.push === 'function' && navigation.push(enseUrlList.key, params);
  };

  _parseText = () => [
    {
      type: 'url',
      style: { ...styles.enseContent, ...styles.enseContentLinked },
      onPress: this._onUrl,
      renderText: renderShortUrl,
    },
    {
      pattern: /#([\w-_]+)/,
      style: { ...styles.enseContent, ...styles.enseContentLinked },
      onPress: this._onTopic,
    },
    {
      pattern: /@([\w-_]+)/,
      style: { ...styles.enseContent, ...styles.enseContentLinked },
      onPress: this._onHandle,
    },
  ];

  render() {
    const { ense } = this.props;
    const { listeners, showListeners, reactions, showReactions } = this.state;
    return (
      <>
        <TouchableHighlight onPress={this._onPress} underlayColor={Colors.gray['1']}>
          <View style={styles.container}>
            <View style={styles.row}>
              <TouchableHighlight onPress={this._goToProfile}>
                <Image
                  source={{ uri: ense.profpic || emptyProfPicUrl }}
                  style={styles.img}
                  resizeMode="cover"
                />
              </TouchableHighlight>
              <View style={styles.topInfo}>
                <View style={styles.detailCol}>
                  <View style={styles.row}>
                    <TouchableHighlight
                      onPress={this._goToProfile}
                      underlayColor={Colors.gray['0']}
                      hitSlop={hitSlop}
                    >
                      <Text style={styles.username} numberOfLines={1}>
                        {ense.nameFitted()}
                      </Text>
                    </TouchableHighlight>
                    <Spacer />
                    {this._topRight()}
                  </View>
                  <Text style={styles.handle} numberOfLines={1}>
                    @{ense.userhandle}
                  </Text>
                </View>
              </View>
            </View>
            <ParsedText style={styles.enseContent} parse={this._parseText()}>
              {ense.title}
            </ParsedText>
            <View style={styles.row}>
              <Text style={styles.minorInfo}>{ense.agoString()}</Text>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.minorInfo}>{ense.createDateString()}</Text>
            </View>
            <View style={[styles.row, styles.statsRow]}>{this._statsRow()}</View>
            <View style={styles.divider} />
            <View style={[styles.row, styles.actionRow]}>{this._actionsRow()}</View>
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
    flexDirection: 'column',
    padding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.gray['1'],
    paddingBottom: 0,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  img: { width: imgSize, height: imgSize, backgroundColor: Colors.gray['1'] },
  username: { ...defaultText, fontWeight: 'bold' },
  statsRow: { marginVertical },
  actionRow: { justifyContent: 'space-between', maxWidth: 500 },
  minorInfo: { ...defaultText, color: Colors.gray['3'] },
  bullet: { ...defaultText, color: Colors.gray['3'], marginHorizontal: quarterPad },
  handle: { ...subText, flexShrink: 1, minWidth: 20 },
  detailInfo: { ...defaultText, paddingLeft: quarterPad, color: Colors.gray['3'] },
  topInfo: { marginLeft, flex: 1 },
  detailCol: { flexDirection: 'column', flex: 1 },
  enseContent: { ...largeText, paddingVertical: padding },
  enseContentLinked: { color: Colors.ense.actionblue },
  nowPlaying: { flexDirection: 'row', alignItems: 'center' },
  txtIcon: { padding },
  playingIcon: { paddingRight: quarterPad },
  nowPlayingTxt: { ...subText, color: Colors.ense.pink },
  detailText: { fontWeight: 'bold', color: Colors.ense.black },
  token: { paddingVertical: 3 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.gray['1'] },
  rightToken: { marginRight: 0 },
  heavyToken: {
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray['3'],
  },
  exclToken: { borderColor: Colors.ense.gold },
  tokenTxt: { textTransform: 'uppercase', fontWeight: 'bold', fontSize: small },
  private: { color: Colors.gray['3'] },
  exclusive: { color: Colors.ense.gold },
});

const WithNav = withNavigation(ExpandedFeedItem);
// $FlowFixMe
export default connect<P, OP, SP, DP, *, *>(
  (s): SP => ({ recordStatus: _recordStatus(s) }),
  (d): DP => ({ updatePlaying: (e: Ense) => d(playSingle(e)) })
  // $FlowFixMe
)(WithNav);
