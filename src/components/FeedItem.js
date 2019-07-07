// @flow
import * as React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { Image, Linking, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { halfPad, hitSlop, marginTop, padding, quarterPad, regular, small } from 'constants/Layout';
import Ense from 'models/Ense';
import { actionText, defaultText, linkedText, subText } from 'constants/Styles';
import { emptyProfPicUrl } from 'constants/Values';
import Colors from 'constants/Colors';
import { playSingle, recordNew } from 'redux/ducks/run';
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
import { SecondaryButton } from 'components/EnseButton';
import { createSelector } from 'redux-starter-kit';
import { getReplyKey } from 'redux/ducks/accounts';

type DP = {| updatePlaying: Ense => void, replyTo: Ense => void |};
type OP = {| ense: Ense, isPlaying: boolean, hideThreads?: boolean |};
type SP = {| recordStatus: ?RecordingStatus, replyUser: ?PublicAccount, replyEnse: ?Ense |};
type P = {| ...DP, ...OP, ...NLP<any>, ...SP |};
type S = {|
  listeners: PublicAccount[],
  showListeners: boolean,
  reactions: PublicAccount[],
  showReactions: boolean,
|};

const imgSize = 32;

class FeedItem extends React.PureComponent<P, S> {
  state = { showListeners: false, listeners: [], showReactions: false, reactions: [] };

  _onPress = () => {
    const { ense, updatePlaying, recordStatus } = this.props;
    if (recordStatus) {
      return;
    }
    updatePlaying(ense);
  };

  _nowPlaying = () => (
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
            <Text style={styles.detailInfo}>{limit(ense.likeTypes, 3, '')}</Text>
            <Text style={actionText}>{ense.likeCount}</Text>
          </>
        )}
      </TouchableHighlight>
    ) : null;

  _privacy = (ense: Ense) =>
    ense.unlisted ? (
      <Text style={[styles.tokenTxt, { color: this._colorFor(ense) }]}>✗ Private</Text>
    ) : null;

  _exclusive = (ense: Ense) =>
    ense.isExclusive ? (
      <Text style={[styles.tokenTxt, { color: this._colorFor(ense) }]}>★ Exclusive</Text>
    ) : null;

  _colorFor = (e: Ense) =>
    // eslint-disable-next-line no-nested-ternary
    e.isExclusive ? Colors.ense.gold : e.unlisted ? Colors.gray['3'] : Colors.text.main;

  _replyTo = (ense: Ense) => (
    <TouchableHighlight
      onPress={() => this.props.replyTo(ense)}
      underlayColor="transparent"
      hitSlop={hitSlop}
    >
      {this._inToken(<Text style={[actionText, styles.reply]}>Reply ▶︎</Text>)}
    </TouchableHighlight>
  );

  _repliesCount = (ense: Ense) =>
    ense.repliesCount ? (
      <TouchableHighlight onPress={this._onConvo} underlayColor="transparent" hitSlop={hitSlop}>
        {this._inToken(<Text style={[actionText, styles.playcount]}>💬 {ense.repliesCount}</Text>)}
      </TouchableHighlight>
    ) : null;

  _listens = (ense: Ense) =>
    ense.playcount ? (
      <TouchableHighlight
        onPress={this._showListeners}
        underlayColor="transparent"
        hitSlop={hitSlop}
      >
        {this._inToken(<Text style={[actionText, styles.playcount]}>🎧 {ense.playcount}</Text>)}
      </TouchableHighlight>
    ) : null;

  _bottomRow = () => {
    const { ense } = this.props;
    return (
      <>
        {this._replyTo(ense)}
        {this._repliesCount(ense)}
        {this._listens(ense)}
        {this._reactions(ense)}
      </>
    );
  };

  _isInReplyTo = () => this.props.replyUser || this.props.replyEnse;

  _threadRow = () => {
    const { replyEnse, replyUser, hideThreads } = this.props;
    if (hideThreads || !this._isInReplyTo()) {
      return null;
    }
    let name;
    let uri;
    if (replyUser) {
      name = replyUser.publicAccountHandle
        ? `@${replyUser.publicAccountHandle}`
        : replyUser.publicAccountDisplayName;
      uri = get(replyUser, 'publicProfileImageUrl');
    } else if (replyEnse) {
      name = replyEnse.userhandle ? `@${replyEnse.userhandle}` : replyEnse.username;
      uri = get(replyEnse, 'profpic');
    }
    name = name || 'anonymous';
    return (
      <View style={[styles.row, styles.inReplyContainer]}>
        <TouchableHighlight onPress={this._onThread} underlayColor="transparent">
          <Image source={{ uri }} style={styles.img} resizeMode="cover" />
        </TouchableHighlight>
        <SecondaryButton style={styles.replyLink} textStyle={styles.link} onPress={this._onThread}>
          In reply to {name}
        </SecondaryButton>
      </View>
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

  _onThread = () => {
    const { ense } = this.props;
    const url = routes.convoFor(ense.handle, ense.key);
    // TODO reply root key?
    const highlight = [ense.key].filter(k => k).map(String);
    this._pushEnseScreen({ title: 'Thread', url, reverse: true, highlight });
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
      style: linkedText,
      onPress: this._onUrl,
      renderText: renderShortUrl,
    },
    { pattern: /#([\w-_]+)/, style: linkedText, onPress: this._onTopic },
    { pattern: /@([\w-_]+)/, style: linkedText, onPress: this._onHandle },
  ];

  render() {
    const { ense, hideThreads, replyUser, replyEnse } = this.props;
    const { listeners, showListeners, reactions, showReactions } = this.state;
    return (
      <>
        <TouchableHighlight onPress={this._onPress} underlayColor={Colors.gray['1']}>
          <View style={styles.root}>
            <View style={styles.row}>
              <View style={styles.imgCol}>
                <TouchableHighlight onPress={this._goToProfile} underlayColor="transparent">
                  <Image
                    source={{ uri: ense.profpic || emptyProfPicUrl }}
                    style={styles.img}
                    resizeMode="cover"
                  />
                </TouchableHighlight>
                {!hideThreads && (replyUser || replyEnse) && (
                  <View style={styles.threadConnector} />
                )}
              </View>
              <View style={styles.enseBody}>
                <View style={styles.detailRow}>
                  <TouchableHighlight
                    onPress={this._goToProfile}
                    underlayColor={Colors.gray['1']}
                    hitSlop={hitSlop}
                  >
                    <View style={styles.row}>
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
                <View style={styles.row}>
                  {this._privacy(ense)}
                  {this._exclusive(ense)}
                  <Text style={styles.timeAgo}>{ense.agoString()}</Text>
                </View>
                <ParsedText style={styles.enseContent} parse={this._parseText()}>
                  {ense.title}
                </ParsedText>
                <View style={styles.summaryRow}>{this._bottomRow()}</View>
              </View>
            </View>
            {this._threadRow()}
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
  root: {
    backgroundColor: 'white',
    flexDirection: 'column',
    padding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.gray['1'],
  },
  inReplyContainer: { marginTop },
  row: { flexDirection: 'row' },
  threadConnector: {
    width: 2,
    backgroundColor: Colors.gray['1'],
    flex: 1,
    borderRadius: 1,
    marginTop: halfPad,
  },
  enseBody: { flexDirection: 'column', flex: 1 },
  horizontalTxt: { flexDirection: 'row', alignItems: 'center' },
  img: {
    width: imgSize,
    height: imgSize,
    borderRadius: imgSize / 2,
    backgroundColor: Colors.gray['0'],
  },
  imgSpace: { width: imgSize, height: imgSize },
  username: { ...defaultText, paddingRight: 5, fontWeight: 'bold', flexShrink: 1 },
  summaryRow: { flexDirection: 'row', marginTop, alignItems: 'center', opacity: 0.75 },
  minorInfo: { fontSize: small, color: Colors.gray['3'], paddingTop: quarterPad },
  handle: { ...subText, flexShrink: 1, minWidth: 20 },
  detailInfo: { ...subText, paddingRight: quarterPad, letterSpacing: -3 },
  imgCol: { paddingTop: 2, marginRight: halfPad, alignItems: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  enseContent: { ...defaultText, paddingVertical: halfPad },
  nowPlaying: { flexDirection: 'row', alignItems: 'center' },
  txtIcon: { paddingRight: quarterPad },
  nowPlayingTxt: { ...subText, color: Colors.ense.pink },
  token: { paddingVertical: 3 },
  timeAgo: { fontSize: small, color: Colors.gray['3'], paddingTop: quarterPad },
  playcount: {},
  reply: { color: Colors.ense.pink },
  rightToken: { marginRight: 0 },
  replyLink: { justifyContent: 'flex-start', flex: 1 },
  link: { color: Colors.ense.actionblue },
  tokenTxt: {
    textTransform: 'uppercase',
    fontSize: small,
    fontWeight: 'bold',
    marginTop: quarterPad,
    marginRight: halfPad,
  },
});

const WithNav = withNavigation(FeedItem);

const makeSelect = () => {
  const sel = createSelector(
    [
      getReplyKey,
      'run.recordStatus',
      'accounts._cache',
      'accounts._handleMap',
      'feed.enses._cache',
    ],
    (replyKey, recordStatus, a, handleMap, cache) => {
      const replyEnse = get(cache, replyKey, null);
      const bestId = replyEnse && (replyEnse.userKey || handleMap[replyEnse.userhandle]);
      const replyUser = bestId && a[bestId] ? PublicAccount.parse(a[bestId]) : null;
      return { replyUser, replyEnse, recordStatus };
    }
  );
  return (s, p) => sel(s, p);
};
// $FlowFixMe
export default connect<P, OP, SP, DP, *, *>(
  makeSelect,
  (d): DP => ({
    updatePlaying: (e: Ense) => d(playSingle(e)),
    replyTo: (ense: Ense) => d(recordNew(ense)),
  })
)(WithNav);
