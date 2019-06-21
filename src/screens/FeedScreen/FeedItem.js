// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { halfPad, hitslop, padding, paddingBottom, quarterPad } from 'constants/Layout';
import Ense from 'models/Ense';
import { actionText, defaultText, subText } from 'constants/Styles';
import { emptyProfPicUrl } from 'constants/Values';
import Colors from 'constants/Colors';
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
      <TouchableHighlight
        onPress={this._showReactions}
        underlayColor="transparent"
        hitSlop={hitslop}
      >
        <View style={styles.horizontalTxt}>
          <Text style={styles.detailInfo}>{ense.likeTypes}</Text>
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
  };

  _bottomRight = () => {
    const { ense } = this.props;
    return (
      <TouchableHighlight
        onPress={this._showListeners}
        underlayColor="transparent"
        hitSlop={hitslop}
      >
        <View style={styles.horizontalTxt}>
          {ense.unlisted && <Text style={styles.private}>Private</Text>}
          <Text style={[actionText, styles.playcount]}>{ense.playCountStr()}</Text>
        </View>
      </TouchableHighlight>
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
                  hitSlop={hitslop}
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
  nameHandle: { flexDirection: 'row' },
  horizontalTxt: { flexDirection: 'row', alignItems: 'center' },
  img: { width: imgSize, height: imgSize, backgroundColor: Colors.gray['0'] },
  username: { ...subText, paddingRight: 5, color: Colors.ense.black, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', marginTop: halfPad, alignItems: 'center' },
  timeAgo: { fontSize: 12, color: Colors.gray['3'], paddingTop: quarterPad },
  handle: { ...subText, flexShrink: 1, minWidth: 20 },
  detailInfo: { ...subText, paddingRight: halfPad },
  imgCol: { paddingTop: 2, paddingBottom, marginRight: halfPad },
  detailRow: { flexDirection: 'row', alignItems: 'baseline' },
  enseContent: { ...defaultText, paddingVertical: halfPad },
  nowPlaying: { flexDirection: 'row', alignItems: 'center' },
  playingIcon: { paddingRight: halfPad },
  nowPlayingTxt: { color: Colors.ense.pink },
  private: {
    color: Colors.gray['4'],
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.gray['2'],
    paddingHorizontal: quarterPad,
    paddingVertical: 2,
  },
  playcount: { marginLeft: halfPad },
});

const WithNav = withNavigation(FeedItem);
export default connect<P, OP, SP, DP, *, *>(
  (s): SP => ({ recordStatus: _recordStatus(s) }),
  (d): DP => ({ updatePlaying: (e: Ense) => d(playSingle(e)) })
  // $FlowFixMe
)(WithNav);
