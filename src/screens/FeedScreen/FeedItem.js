// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Icon } from 'react-native-elements';
import { StyleSheet, Text, View, Image, TouchableHighlight } from 'react-native';
import { padding, paddingBottom, halfPad, quarterPad } from 'constants/Layout';
import Ense from 'models/Ense';
import { actionText, defaultText, subText } from 'constants/Styles';
import { anonName, emptyProfPicUrl } from 'constants/Values';
import Colors from 'constants/Colors';
import { trunc } from 'utils/strings';
import { playSingle } from 'redux/ducks/run';
import type { NLP } from 'utils/types';
import { pubProfile } from 'navigation/keys';

type DP = {| updatePlaying: Ense => void |};
type OP = {| ense: Ense, isPlaying: boolean |};

type P = {| ...DP, ...OP, ...NLP<any> |};
const imgSize = 40;

class FeedItem extends React.Component<P> {
  _statusInfo = () => {
    const { ense } = this.props;
    return ense.likeCount ? (
      <>
        <Text style={styles.detailInfo}>{ense.likeTypes}</Text>
        <Text style={actionText}>{ense.likeCount}</Text>
      </>
    ) : null;
  };

  _onPress = () => {
    this.props.updatePlaying(this.props.ense);
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
      <Text style={actionText}>
        {ense.playcount} {ense.playcount === 1 ? 'Listen' : 'Listens'}
      </Text>
    );
  };

  _goToProfile = () => {
    // TODO prevent going to current profile
    const { userId, handle } = this.props;
    const params = { userId, handle };
    this.props.navigation.navigate({ routeName: pubProfile.key, key: '', params });
  };

  render() {
    const { ense, isPlaying } = this.props;
    const boldStyle = isPlaying ? { fontWeight: 'bold' } : {};
    return (
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

const WN = withNavigation(FeedItem);
export default connect<P, OP, *, DP, *, *>(
  null,
  // $FlowIssue - dunno
  (d: DP) => ({ updatePlaying: (e: Ense) => d(playSingle(e)) })
)(WN);
