// @flow
import * as React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { halfPad, hitSlop, marginTop, padding, quarterPad, regular, small } from 'constants/Layout';
import Ense from 'models/Ense';
import { actionText, defaultText, subText } from 'constants/Styles';
import { emptyProfPicUrl, publicUrlFor } from 'constants/Values';
import Colors from 'constants/Colors';
import { playSingle, recordNew } from 'redux/ducks/run';
import type { NLP } from 'utils/types';
import { pubProfile, enseUrlList, root } from 'navigation/keys';
import { RecordingStatus } from 'expo-av/build/Audio/Recording';
import { $delete, $get, $post } from 'utils/api';
import routes from 'utils/api/routes';
import PublicAccount from 'models/PublicAccount';
import ParsedText from 'components/ParsedText';
import { ListensOverlay, ReactionsOverlay } from 'components/Overlays';
import type { EnseJSON, ListensPayload } from 'utils/api/types';
import { asArray } from 'utils/other';
import type { EnseUrlScreenParams as EUSP } from 'screens/EnseUrlScreen';
import { limit } from 'stringz';
import { SecondaryButton } from 'components/EnseButton';
import { createSelector } from 'redux-starter-kit';
import { getReplyKey } from 'redux/ducks/accounts';
import parser from 'utils/textLink';
import { userSelector } from 'redux/ducks/auth';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import Share from 'react-native-share';
import { cacheEnses as _cacheEnses } from 'redux/ducks/feed';
import User from 'models/User';
import { displayCount } from 'utils/strings';

type DP = {|
  updatePlaying: Ense => Promise<any>,
  replyTo: Ense => void,
  cacheEnses: (EnseJSON | EnseJSON[]) => void,
|};
type OP = {| ense: Ense, isPlaying: boolean, hideThreads?: boolean, onPress?: () => Promise<any> |};
type SP = {|
  recordStatus: ?RecordingStatus,
  replyUser: ?PublicAccount,
  replyEnse: ?Ense,
  me: ?User,
|};
type P = {| ...DP, ...OP, ...NLP<any>, ...SP |};
type S = {|
  listeners: PublicAccount[],
  showListeners: boolean,
  reactions: PublicAccount[],
  showReactions: boolean,
  blockPress: boolean,
|};

const imgSize = 32;

class FeedItem extends React.PureComponent<P, S> {
  state = {
    showListeners: false,
    listeners: [],
    showReactions: false,
    reactions: [],
    blockPress: false,
  };

  _onPress = async () => {
    const { ense, updatePlaying, recordStatus, onPress } = this.props;
    if (this.state.blockPress || recordStatus) {
      return;
    }
    this.setState({ blockPress: true });
    // by default toggle play if there isn't a press handler
    await (onPress ? onPress() : updatePlaying(ense));
    this.setState({ blockPress: false });
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

  _inToken = (node: React.Node, style?: Object = { marginRight: 18 }) => (
    <View style={[styles.centeredRow, styles.token, ...asArray(style || {})]}>{node}</View>
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
            <Text style={styles.detailInfo}>{limit(ense.likeTypes, 1, '')}</Text>
            <Text style={[actionText, styles.actionCount]}>{displayCount(ense.likeCount)}</Text>
          </>
        )}
      </TouchableHighlight>
    ) : null;

  _addReaction = () => (
    <TouchableHighlight
      onPress={this._showAddReaction}
      underlayColor="transparent"
      hitSlop={hitSlop}
    >
      {this._inToken(
        <Icon name="tag-faces" type="material" color={Colors.text.secondary} size={20} />
      )}
    </TouchableHighlight>
  );

  _openShare = () => {
    Share.open({ url: publicUrlFor(this.props.ense) });
  };

  _showMoreActions = () => {
    const { ense, me, cacheEnses } = this.props;
    if (!me) {
      return;
    }
    const favorited = ense.userFavorited;
    const isMine = String(ense.userKey) === String(me.id);
    console.log(ense.userKey, me.id);
    const options = [
      `${favorited ? 'Remove from' : 'Add to'} favorites`,
      'Report',
      isMine && (ense.unlisted ? 'Make Public' : 'Make Private'),
      'Share',
      'Cancel',
    ].filter(o => o);
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      async (idx: number) => {
        if (idx === 0) {
          const fn = favorited ? $delete : $post;
          await fn(routes.playlistElem, {
            playlist_key: me.favorites.split('/')[0],
            playlist_handle: me.favorites.split('/')[1],
            ense_key: ense.key,
            ense_handle: ense.handle,
          });
        } else if (idx === 1) {
          // noop for now
          console.log('report');
        } else if (idx === 2 && isMine) {
          const route = routes.enseResource(ense.handle, ense.key);
          await $post(route, { unlisted: !ense.unlisted });
          const json = get(await $get(route), 'contents');
          if (json) {
            cacheEnses(json);
          }
        } else if (idx === options.length - 2) {
          this._openShare();
        }
      }
    );
  };

  _moreActions = ense => (
    <TouchableHighlight
      onPress={this._showMoreActions}
      underlayColor="transparent"
      hitSlop={hitSlop}
    >
      {this._inToken(
        <Icon name="ellipsis-fill" type="enseicons" color={Colors.text.secondary} size={20} />
      )}
    </TouchableHighlight>
  );

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
      {this._inToken(<Text style={[actionText, styles.reply]}>Reply</Text>)}
    </TouchableHighlight>
  );

  _listens = (ense: Ense) =>
    ense.playcount ? (
      <TouchableHighlight
        onPress={this._showListeners}
        underlayColor="transparent"
        hitSlop={hitSlop}
      >
        {this._inToken(
          <View style={styles.centeredRow}>
            <Icon name="headphones-fill" type="enseicons" color={Colors.text.secondary} size={22} />
            <Text style={[actionText, styles.actionCount]}>{displayCount(ense.playcount)}</Text>
          </View>
        )}
      </TouchableHighlight>
    ) : null;

  _bottomRow = () => {
    const { ense } = this.props;
    return (
      <View style={styles.centeredRow}>
        {this._replyTo(ense)}
        {this._addReaction()}
        {this._listens(ense)}
        {this._reactions(ense)}
        <View style={styles.spacer} />
        {this._moreActions(ense)}
      </View>
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
        <SecondaryButton style={styles.replyLink} onPress={this._onThread}>
          <View style={styles.centeredRow}>
            <Text style={styles.link}>In reply to {name}</Text>
            <Icon name="caret-right" type="enseicons" color={Colors.gray['2']} />
          </View>
        </SecondaryButton>
      </View>
    );
  };

  _repliesRow = () => {
    const { ense } = this.props;
    const c = ense.repliesCount;
    if (!c) {
      return null;
    }
    return (
      <View style={[styles.row, styles.inReplyContainer]}>
        <Icon name="messages" type="enseicons" color={Colors.gray['2']} size={32} />
        <SecondaryButton style={styles.replyLink} onPress={this._onConvo}>
          <View style={styles.centeredRow}>
            <Text style={styles.link}>Show this thread ({c})</Text>
            <Icon name="caret-right" type="enseicons" color={Colors.gray['2']} />
          </View>
        </SecondaryButton>
      </View>
    );
  };

  _durationTxt = () => {
    const { ense, isPlaying } = this.props;
    if (isPlaying) {
      return this._nowPlaying();
    }
    return <Text style={[subText, styles.duration]}>{ense.durationString()}</Text>;
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
    $get(routes.reactions(ense.handle, ense.key)).then((list: ListensPayload) => {
      const reactions = list.map(([_, a]) => PublicAccount.parse(a));
      this.setState({ reactions });
    });
    ense.likeCount && this.setState({ showReactions: true });
  };

  _showAddReaction = () => {
    const { ense } = this.props;
    this.props.navigation.navigate(root.addReaction.key, { ense });
  };

  _closeListens = () => this.setState({ showListeners: false });
  _closeReactions = () => this.setState({ showReactions: false });

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

  render() {
    const { ense, hideThreads, replyUser, replyEnse, navigation } = this.props;
    const { listeners, showListeners, reactions, showReactions, blockPress } = this.state;
    return (
      <>
        <TouchableHighlight
          onPress={this._onPress}
          underlayColor={Colors.gray['1']}
          disabled={blockPress}
        >
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
                    </View>
                  </TouchableHighlight>
                  <View style={styles.spacer} />
                  <Text style={styles.timeAgo}>{ense.agoString()}</Text>
                </View>
                <View style={[styles.row, styles.subRow]}>
                  <Text style={styles.handle} numberOfLines={1}>
                    @{ense.userhandle}
                  </Text>
                  {this._durationTxt()}
                </View>
                <ParsedText style={styles.enseContent} parse={parser(navigation)}>
                  {ense.title}
                </ParsedText>
                {this._privacy(ense)}
                {this._exclusive(ense)}
                <View style={styles.summaryRow}>{this._bottomRow()}</View>
              </View>
            </View>
            {this._threadRow()}
            {this._repliesRow()}
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
  centeredRow: { flexDirection: 'row', alignItems: 'center' },
  subRow: { marginVertical: quarterPad, justifyContent: 'space-between' },
  threadConnector: {
    width: 2,
    backgroundColor: Colors.gray['1'],
    flex: 1,
    borderRadius: 1,
    marginTop: halfPad,
  },
  enseBody: { flexDirection: 'column', flex: 1 },
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
  handle: { ...subText, flexShrink: 1, minWidth: 20, color: Colors.gray['3'] },
  detailInfo: { ...subText, paddingRight: quarterPad, letterSpacing: -3 },
  imgCol: { paddingTop: 2, marginRight: halfPad, alignItems: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  enseContent: { ...defaultText, paddingVertical: halfPad },
  nowPlaying: { flexDirection: 'row', alignItems: 'center' },
  txtIcon: { paddingRight: quarterPad },
  nowPlayingTxt: { ...subText, color: Colors.ense.pink },
  token: { paddingVertical: 3 },
  timeAgo: { fontSize: small, color: Colors.gray['3'] },
  duration: { color: Colors.gray['3'], fontSize: small },
  actionCount: {},
  reply: { color: Colors.ense.pink, fontWeight: 'bold' },
  rightToken: { marginRight: 0 },
  replyLink: { justifyContent: 'flex-start', flex: 1, paddingVertical: 0, paddingRight: 0 },
  link: { ...subText, flex: 1 },
  spacer: { flex: 1 },
  tokenTxt: {
    textTransform: 'uppercase',
    fontSize: small,
    fontWeight: 'bold',
    marginTop: halfPad,
    marginRight: halfPad,
  },
});

const WithActionSheet = connectActionSheet(FeedItem);
const WithNav = withNavigation(WithActionSheet);

const makeSelect = () => {
  const sel = createSelector(
    [
      getReplyKey,
      'run.recordStatus',
      'accounts._cache',
      'accounts._handleMap',
      'feed.enses._cache',
      userSelector,
    ],
    (replyKey, recordStatus, a, handleMap, cache, me) => {
      const replyEnse = get(cache, replyKey, null);
      const bestId = replyEnse && (replyEnse.userKey || handleMap[replyEnse.userhandle]);
      const replyUser = bestId && a[bestId] ? PublicAccount.parse(a[bestId]) : null;
      return { replyUser, replyEnse, recordStatus, me };
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
    cacheEnses: (ense: EnseJSON[] | EnseJSON) => d(_cacheEnses(ense)),
  })
)(WithNav);
