// @flow

import React from 'react';
import { zipObject, omitBy } from 'lodash';
import { connect } from 'react-redux';
import { SectionList, Image, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { $get, routes } from 'utils/api';
import { saveFeedsList, saveEnses, selectFeedLists } from 'redux/ducks/feed';
import Feed from 'models/Feed';
import type { FeedResponse, FeedJSON } from 'utils/api/types';
import type { EnseGroups, SelectedHome, SelectedFeedLists } from 'redux/ducks/feed';

type SP = SelectedHome & SelectedFeedLists;
type DP = {
  saveFeeds: (FeedJSON[]) => void,
  saveEnses: EnseGroups => void,
};

type P = SP & DP;
class FeedScreen extends React.Component<P> {
  static navigationOptions = {
    title: 'Home',
  };

  componentDidMount(): void {
    this.fetchFeeds()
      .then(this.fetchEnsesBatch)
      .then(this.saveEnsesBatch);
  }

  fetchFeeds = async (): Promise<Feed[]> => {
    const feeds: FeedJSON[] = await $get(routes.explore);
    this.props.saveFeeds(feeds);
    return feeds.map(Feed.parse);
  };

  fetchEnses = async (forFeed: Feed) => forFeed.fetch().catch(e => e);

  fetchEnsesBatch = async (forFeeds: Feed[]) =>
    Promise.all(forFeeds.map(this.fetchEnses)).then(responses =>
      zipObject(forFeeds.map(f => f.url), responses)
    );

  saveEnsesBatch = async (feeds: { [string]: FeedResponse | Error }) => {
    this.props.saveEnses(omitBy(feeds, v => v instanceof Error));
  };

  render() {
    return (
      <SectionList
        style={styles.container}
        renderItem={this._renderItem}
        renderSectionHeader={this._renderSectionHeader}
        stickySectionHeadersEnabled
        keyExtractor={(item, index) => index}
        ListHeaderComponent={ListHeader}
        sections={[]}
      />
    );
  }

  _renderSectionHeader = ({ section }) => {
    return <SectionHeader title={section.title} />;
  };

  _renderItem = ({ item }) => {
    if (item.type === 'color') {
      return <SectionContent>{item.value && <Color value={item.value} />}</SectionContent>;
    } else {
      return (
        <SectionContent>
          <Text style={styles.sectionContentText}>{item.value}</Text>
        </SectionContent>
      );
    }
  };
}

const ListHeader = () => {
  const { manifest } = Constants;
  return (
    <View style={styles.titleContainer}>
      <View style={styles.titleIconContainer}>
        <AppIconPreview iconUrl={manifest.iconUrl} />
      </View>
      <View style={styles.titleTextContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {manifest.name}
        </Text>
        <Text style={styles.slugText} numberOfLines={1}>
          {manifest.slug}
        </Text>
        <Text style={styles.descriptionText}>{manifest.description}</Text>
      </View>
    </View>
  );
};

const SectionHeader = ({ title }) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
};

const SectionContent = props => {
  return <View style={styles.sectionContentContainer}>{props.children}</View>;
};

const AppIconPreview = ({ iconUrl }) => {
  if (!iconUrl) {
    iconUrl = 'https://s3.amazonaws.com/exp-brand-assets/ExponentEmptyManifest_192.png';
  }

  return <Image source={{ uri: iconUrl }} style={{ width: 64, height: 64 }} resizeMode="cover" />;
};

const Color = ({ value }) => {
  if (!value) {
    return <View />;
  } else {
    return (
      <View style={styles.colorContainer}>
        <View style={[styles.colorPreview, { backgroundColor: value }]} />
        <View style={styles.colorTextContainer}>
          <Text style={styles.sectionContentText}>{value}</Text>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    backgroundColor: 'lightgray',
  },
  titleIconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  sectionHeaderContainer: {
    backgroundColor: '#fbfbfb',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ededed',
  },
  sectionHeaderText: {
    fontSize: 14,
  },
  sectionContentContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 15,
  },
  sectionContentText: {
    color: '#808080',
    fontSize: 14,
  },
  nameText: {
    fontWeight: '600',
    fontSize: 18,
  },
  slugText: {
    color: '#a39f9f',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 6,
    color: '#4d4d4d',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 17,
    height: 17,
    borderRadius: 2,
    marginRight: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  colorTextContainer: {
    flex: 1,
  },
});

const select = s => ({
  // ...selectEnses(s),
  ...selectFeedLists(s),
});
const disp = d => ({
  saveFeeds: feeds => d(saveFeedsList(feeds)),
  saveEnses: enses => d(saveEnses(enses)),
});
export default connect(
  select,
  disp
)(FeedScreen);
