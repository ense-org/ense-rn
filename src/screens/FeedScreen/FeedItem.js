// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, View, Image, TouchableHighlight } from 'react-native';
import { padding, paddingBottom, halfPad, quarterPad } from 'constants/Layout';
import Ense from 'models/Ense';
import { actionText, defaultText, subText } from 'constants/Styles';
import { anonName, emptyProfPicUrl } from 'constants/Values';
import Colors from 'constants/Colors';
import { trunc } from 'utils/strings';
import { updateEnse } from 'redux/ducks/player';

type DP = { updatePlaying: Ense => void };
type OP = {
  ense: Ense,
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

  render() {
    const { ense } = this.props;
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
              <Text style={actionText}>
                {ense.playcount} {ense.playcount === 1 ? 'Listen' : 'Listens'}
              </Text>
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
  enseBody: {
    flexDirection: 'column',
    flex: 1,
  },
  img: { width: imgSize, height: imgSize, backgroundColor: Colors.gray['0'] },
  username: {
    ...subText,
    paddingRight: 5,
    color: Colors.ense.black,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: halfPad,
  },
  timeAgo: {
    fontSize: 12,
    color: Colors.gray['3'],
    paddingTop: quarterPad,
  },
  handle: {
    ...subText,
    flexShrink: 1,
    minWidth: 20,
  },
  detailInfo: {
    ...subText,
    paddingRight: halfPad,
  },
  imgCol: {
    paddingTop: 2,
    paddingBottom,
    marginRight: halfPad,
  },
  detailRow: {
    flexDirection: 'row',
  },
  enseContent: {
    ...defaultText,
    paddingVertical: halfPad,
  },
});

export default connect(
  null,
  d => ({ updatePlaying: e => d(updateEnse(e)) })
)(FeedItem);
