// @flow
import * as React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import Share from 'react-native-share';
import { withNavigation } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import {
  hitSlop,
  marginLeft,
  marginVertical,
  padding,
  quarterPad,
  regular,
  small,
  xlargeFont,
} from 'constants/Layout';
import Ense from 'models/Ense';
import { defaultText, largeText, subText } from 'constants/Styles';
import { emptyProfPicUrl, publicUrlFor } from 'constants/Values';
import Colors from 'constants/Colors';
import { playSingle, recordNew, recordStatus as _recordStatus } from 'redux/ducks/run';
import type { NLP } from 'utils/types';
import { enseUrlList, pubProfile, root } from 'navigation/keys';
import { RecordingStatus } from 'expo-av/build/Audio/Recording';
import { $delete, $get, $post } from 'utils/api';
import routes from 'utils/api/routes';
import PublicAccount from 'models/PublicAccount';
import ParsedText from 'components/ParsedText';
import { ListensOverlay, ReactionsOverlay } from 'components/Overlays';
import type { ListensPayload } from 'utils/api/types';
import { asArray } from 'utils/other';
import type { EnseUrlScreenParams as EUSP } from 'screens/EnseUrlScreen';
import Spacer from 'components/Spacer';
import parser from 'utils/textLink';
import { createSelector } from 'redux-starter-kit';
import { userSelector } from 'redux/ducks/auth';
import type { EnseJSON } from 'models/types';
import { cacheEnses as _cacheEnses } from 'redux/ducks/feed';
import User from 'models/User';

type DP = {| updatePlaying: Ense => Promise<any>, cacheEnses: (EnseJSON | EnseJSON[]) => void |};
type OP = {| ense: Ense, isPlaying: boolean, onPress?: () => Promise<any> |};
type SP = {| recordStatus: ?RecordingStatus, me: ?User |};
type P = {| ...DP, ...OP, ...NLP<any>, ...SP |};
type S = {|
  listeners: PublicAccount[],
  showListeners: boolean,
  reactions: PublicAccount[],
  showReactions: boolean,
  blockPress: boolean,
|};

const imgSize = 32;

class ExpandedFeedItem extends React.PureComponent<P, S> {
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

  _showExtras = () => {
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
          await $post(route, {
            unlisted: !ense.unlisted,
          });
          const json = get(await $get(route), 'contents');
          if (json) {
            cacheEnses(json);
          }
        }
      }
    );
  };

  _addReaction = () =>
    this.props.navigation.navigate(root.addReaction.key, { ense: this.props.ense });

  _openShare = () => {
    Share.open({ url: publicUrlFor(this.props.ense) });
  };

  _actionsRow = () => {
    const { ense } = this.props;
    return (
      <>
        <Icon
          iconStyle={styles.txtIcon}
          onPress={() => this.props.replyTo(ense)}
          size={xlargeFont}
          type="enseicons"
          name="reply"
          color={Colors.gray['4']}
        />
        <Icon
          iconStyle={styles.txtIcon}
          onPress={this._addReaction}
          size={xlargeFont}
          name="tag-faces"
          type="material"
          color={Colors.gray['4']}
        />
        <Icon
          iconStyle={styles.txtIcon}
          onPress={this._openShare}
          size={xlargeFont}
          type="enseicons"
          name="share"
          color={Colors.gray['4']}
        />
        <Icon
          iconStyle={styles.txtIcon}
          onPress={this._showExtras}
          size={xlargeFont}
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
    $get(routes.reactions(ense.handle, ense.key)).then((list: ListensPayload) => {
      this.setState({ reactions: list.map(([_, a]) => PublicAccount.parse(a)) });
    });
    ense.likeCount && this.setState({ showReactions: true });
  };

  _closeListens = () => this.setState({ showListeners: false });
  _closeReactions = () => this.setState({ showReactions: false });

  _pushEnseScreen = (params: EUSP) => {
    const { navigation } = this.props;
    // $FlowIgnore - we can do better nav typing eventually
    typeof navigation.push === 'function' && navigation.push(enseUrlList.key, params);
  };

  render() {
    const { ense, navigation } = this.props;
    const { listeners, showListeners, reactions, showReactions, blockPress } = this.state;
    return (
      <>
        <TouchableHighlight
          onPress={this._onPress}
          underlayColor={Colors.gray['1']}
          disabled={blockPress}
        >
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
            <ParsedText style={styles.enseContent} parse={parser(navigation, styles.enseContent)}>
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
  img: {
    width: imgSize,
    height: imgSize,
    borderRadius: imgSize / 2,
    backgroundColor: Colors.gray['0'],
  },
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

const WithActionSheet = connectActionSheet(ExpandedFeedItem);
const WithNav = withNavigation(WithActionSheet);
const selector = createSelector(
  [_recordStatus, userSelector],
  (recordStatus, me) => ({ recordStatus, me })
);
// $FlowFixMe
export default connect<P, OP, SP, DP, *, *>(
  selector,
  (d): DP => ({
    updatePlaying: (e: Ense) => d(playSingle(e)),
    replyTo: (ense: Ense) => d(recordNew(ense)),
    cacheEnses: (ense: EnseJSON[] | EnseJSON) => d(_cacheEnses(ense)),
  })
  // $FlowFixMe
)(WithNav);
