// @flow
import * as React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { padding, paddingBottom, halfPad, quarterPad } from 'constants/Layout';
import Ense from 'models/Ense';
import { defaultText, subText } from 'constants/Styles';
import { anonName, emptyProfPicUrl } from 'constants/Values';
import { gray } from 'constants/Colors';
import { trunc } from 'utils/strings';

type P = {
  ense: Ense,
};

const imgSize = 40;

export default class FeedItem extends React.Component<P> {
  render() {
    const { ense } = this.props;
    return (
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
            <Text style={styles.detailInfo}>{ense.playcount} plays</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding,
    marginVertical: 1,
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
  },
  timeAgo: {
    fontSize: 12,
    color: gray['3'],
    paddingTop: quarterPad,
  },
  handle: {
    ...subText,
    flexShrink: 1,
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
