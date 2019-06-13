// @flow
import * as React from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight } from 'react-native';
import { padding, paddingBottom, halfPad, quarterPad } from 'constants/Layout';
import Ense from 'models/Ense';
import { actionText, defaultText, subText } from 'constants/Styles';
import { anonName, emptyProfPicUrl } from 'constants/Values';
import Colors from 'constants/Colors';
import { trunc } from 'utils/strings';

type P = {
  ense: Ense,
};

const imgSize = 40;

export default class FeedItem extends React.Component<P> {
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
    console.log('play click');
  };

  render() {
    const { ense } = this.props;
    return (
      <TouchableHighlight onPress={this._onPress} underlayColor={Colors.gray['0']}>
        <View style={styles.container}>
          <View style={styles.imgCol}>
            <Image
              source={{ uri: ense.profpic || emptyProfPicUrl }}
              style={{ width: imgSize, height: imgSize }}
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
  username: {
    ...subText,
    paddingRight: 5,
    color: 'black',
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
