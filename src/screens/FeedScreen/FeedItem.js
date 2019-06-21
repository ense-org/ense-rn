// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { halfPad, padding, paddingBottom, quarterPad } from 'constants/Layout';
import Ense from 'models/Ense';
import { actionText, defaultText, subText } from 'constants/Styles';
import { anonName, emptyProfPicUrl } from 'constants/Values';
import Colors from 'constants/Colors';
import { trunc } from 'utils/strings';
import { playSingle, recordStatus as _recordStatus } from 'redux/ducks/run';
import type { NLP } from 'utils/types';
import { pubProfile } from 'navigation/keys';
import { RecordingStatus } from 'expo-av/build/Audio/Recording';
import { $get } from 'utils/api';
import routes from 'utils/api/routes';
import PublicAccount from 'models/PublicAccount';
import { ListensOverlay } from 'components/Overlays';
import type { ListensPayload } from 'utils/api/types';

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
      <TouchableHighlight onPress={this._showReactions} underlayColor="transparent">
        <View style={styles.statusInfo}>
          <Text style={styles.detailInfo}>{ense.likeTypes}</Text>
          <Text style={actionText}>{ense.likeCount}</Text>
        </View>
      </TouchableHighlight>
    ) : null;
  };

  _onPress = () => {
    const { recordStatus, ense, updatePlaying } = this.props;
    // TODO pause current ense
    // d => ({ setPaused: p => d(setCurrentPaused(p)) })
    !recordStatus && updatePlaying(ense);
  };

  _bottomRight = () => {
    const { ense, isPlaying } = this.props;
    if (isPlaying) {
      return (
        <View style={styles.nowPlaying}>
          <Icon
            iconStyle={styles.playingIcon}
            size={14}
            name="play-circle"
            type="font-awesome"
            color={Colors.ense.pink}
            disabledStyle={styles.disabledButton}
          />
          <Text style={styles.nowPlayingTxt}>Playing</Text>
        </View>
      );
    }
    return (
      <TouchableHighlight onPress={this._showListeners} underlayColor="transparent">
        <Text style={actionText}>
          {ense.playcount} {ense.playcount === 1 ? 'Listen' : 'Listens'}
        </Text>
      </TouchableHighlight>
    );
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
    this.setState({ showListeners: true });
  };

  _showReactions = () => {
    const { ense } = this.props;
    $get(routes.reactionsFor(ense.handle, ense.key)).then((list: ListensPayload) => {
      this.setState({ reactions: list.map(([_, a]) => PublicAccount.parse(a)) });
    });
    this.setState({ showReactions: true });
  };

  _closeListens = () => this.setState({ showListeners: false });
  _closeReactions = () => this.setState({ showReactions: false });

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
                <Text style={styles.username} numberOfLines={1}>
                  {trunc(ense.username || anonName, 25)}
                </Text>
                <Text style={styles.handle} numberOfLines={1}>
                  @{ense.userhandle}
                </Text>
                <View style={{ flex: 1 }} />
                <Text style={subText}>{ense.durationString()}</Text>
              </View>
              <Text style={styles.timeAgo}>{ense.agoString()}</Text>
              <Text style={styles.enseContent}>{ense.title}</Text>
              <View style={styles.summaryRow}>
                {this._statusInfo()}
                <View style={{ flex: 1 }} />
                {this._bottomRight()}
              </View>
            </View>
          </View>
        </TouchableHighlight>
        <ListensOverlay visible={showListeners} accounts={listeners} close={this._closeListens} />
        <ListensOverlay visible={showReactions} accounts={reactions} close={this._closeReactions} />
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
  statusInfo: { flexDirection: 'row' },
  img: { width: imgSize, height: imgSize, backgroundColor: Colors.gray['0'] },
  username: { ...subText, paddingRight: 5, color: Colors.ense.black, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', marginTop: halfPad },
  timeAgo: { fontSize: 12, color: Colors.gray['3'], paddingTop: quarterPad },
  handle: { ...subText, flexShrink: 1, minWidth: 20 },
  detailInfo: { ...subText, paddingRight: halfPad },
  imgCol: { paddingTop: 2, paddingBottom, marginRight: halfPad },
  detailRow: { flexDirection: 'row' },
  enseContent: { ...defaultText, paddingVertical: halfPad },
  nowPlaying: { flexDirection: 'row', alignItems: 'center' },
  playingIcon: { paddingRight: halfPad },
  nowPlayingTxt: { color: Colors.ense.pink },
});

export default withNavigation(
  connect<P, OP, SP, DP, *, *>(
    (s): SP => ({ recordStatus: _recordStatus(s) }),
    (d): DP => ({
      updatePlaying: (e: Ense) => d(playSingle(e)),
    })
  )(FeedItem)
);
