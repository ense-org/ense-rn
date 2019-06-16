// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import { StyleSheet, Text, View, Image, TouchableHighlight } from 'react-native';
import { padding, paddingBottom, halfPad, quarterPad } from 'constants/Layout';
import Ense from 'models/Ense';
import { actionText, defaultText, subText } from 'constants/Styles';
import { anonName, emptyProfPicUrl } from 'constants/Values';
import Colors from 'constants/Colors';
import { trunc } from 'utils/strings';
import { playSingle } from 'redux/ducks/run';

type DP = { updatePlaying: Ense => void };
type OP = {
  ense: Ense,
  isPlaying: boolean,
};

type P = OP & DP;
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

  render() {
    const { ense, isPlaying } = this.props;
    const boldStyle = isPlaying ? { fontWeight: 'bold' } : {};
    return (
      <TouchableHighlight onPress={this._onPress} underlayColor={Colors.gray['1']}>
        <View style={styles.container}>
          <View style={styles.imgCol}>
            <Image
              source={{ uri: ense.profpic || emptyProfPicUrl }}
              style={styles.img}
              resizeMode="cover"
            />
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

export default connect<P, *, *, *, *, *>(
  null,
  d => ({ updatePlaying: e => d(playSingle(e)) })
)(FeedItem);
