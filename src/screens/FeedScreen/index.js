// @flow

import React from 'react';
import { get, zipObject, omitBy } from 'lodash';
import { connect } from 'react-redux';
import { SectionList, StyleSheet } from 'react-native';
import { $get, routes } from 'utils/api';
import { saveFeedsList, saveEnses, selectFeedLists, selectHome } from 'redux/ducks/feed';
import Feed from 'models/Feed';
import Colors from 'constants/Colors';
import type { FeedResponse, FeedJSON } from 'utils/api/types';
import type { EnseGroups, SelectedHome, SelectedFeedLists, HomeSection } from 'redux/ducks/feed';
import EmptyListView from 'components/EmptyListView';
import type { EnseId } from 'models/types';
import { currentlyPlaying } from 'redux/ducks/run';
import Ense from 'models/Ense';
import HomeFeedHeader from './HomeFeedHeader';
import FeedSectionHeader from './FeedSectionHeader';
import FeedItem from './FeedItem';

type SP = SelectedHome & SelectedFeedLists & { currentlyPlaying: ?Ense };
type DP = { saveFeeds: (FeedJSON[]) => void, saveEnses: EnseGroups => void };
type P = SP & DP;

class FeedScreen extends React.Component<P> {
  static navigationOptions = { title: 'home' };

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
        keyExtractor={item => item}
        ListEmptyComponent={EmptyListView}
        ListHeaderComponent={HomeFeedHeader}
        sections={this.props.home.sections}
      />
    );
  }

  _renderSectionHeader = ({ section }: { section: HomeSection }) => (
    <FeedSectionHeader title={section.feed.title} />
  );

  _renderItem = ({ item }: { item: EnseId }) => (
    <FeedItem
      ense={this.props.home.enses[item]}
      isPlaying={item === get(this.props, 'currentlyPlaying.key')}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[0] },
  sectionContentContainer: {
    flexDirection: 'column',
    padding: 16,
  },
  sectionContentText: {
    color: '#808080',
    fontSize: 14,
  },
});

const select = s => ({
  ...selectHome(s),
  ...selectFeedLists(s),
  currentlyPlaying: currentlyPlaying(s),
});
const disp = d => ({
  saveFeeds: feeds => d(saveFeedsList(feeds)),
  saveEnses: enses => d(saveEnses(enses)),
});
export default connect<P, *, *, *, *, *>(
  select,
  disp
)(FeedScreen);
