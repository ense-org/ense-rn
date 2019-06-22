// @flow

import React from 'react';
import { get, zipObject, omitBy } from 'lodash';
import { createSelector } from 'redux-starter-kit';
import { ScrollableTabView } from 'components/vendor/ScrollableTabView';
import { connect } from 'react-redux';
import { SectionList, StyleSheet, RefreshControl } from 'react-native';
import { $get, routes } from 'utils/api';
import { saveFeedsList, replaceEnses, updateEnses, feedLists, home } from 'redux/ducks/feed';
import Feed from 'models/Feed';
import Colors from 'constants/Colors';
import type { FeedResponse, FeedJSON, TrendingTopics, FeedPath } from 'utils/api/types';
import type { EnseGroups, HomeInfo, SelectedFeedLists } from 'redux/ducks/feed';
import EmptyListView from 'components/EmptyListView';
import type { EnseId } from 'models/types';
import { currentlyPlaying } from 'redux/ducks/run';
import Ense from 'models/Ense';
import FeedItem from './FeedItem';

type SP = {| home: HomeInfo, ...SelectedFeedLists, currentlyPlaying: ?Ense |};
type DP = {|
  saveFeeds: (FeedJSON[]) => void,
  replaceEnses: EnseGroups => void,
  updateEnses: EnseGroups => void,
|};
type P = {| ...DP, ...SP |};

type S = { refreshing: { [string]: boolean } };
class FeedScreen extends React.Component<P, S> {
  static navigationOptions = { title: 'ense' };
  state = { refreshing: {} };

  componentDidMount(): void {
    this.fetchFeeds()
      .then(this.fetchEnsesBatch)
      .then(this.saveEnsesBatch);
  }

  fetchAndSave = (feed: Feed) => {
    this._setRefreshing(feed, true);
    this.fetchEnsesBatch([feed])
      .then(this.props.updateEnses)
      .finally(() => this._setRefreshing(feed, false));
  };

  fetchFeeds = async (): Promise<Feed[]> => {
    const feeds: FeedJSON[] = await $get(routes.explore);
    this.props.saveFeeds(feeds);
    return feeds.map(Feed.parse);
  };

  fetchTrending = async (): Promise<TrendingTopics> => {
    return $get(routes.trendingTopics);
  };

  _setRefreshing = (feed: Feed, refreshing: boolean) =>
    this.setState(s => ({ refreshing: { ...s.refreshing, [feed.title]: refreshing } }));

  fetchEnses = async (forFeed: Feed) => forFeed.fetch().catch(e => e);

  fetchEnsesBatch = async (forFeeds: Feed[]) =>
    Promise.all(forFeeds.map(this.fetchEnses)).then(responses =>
      zipObject(forFeeds.map(f => f.url), responses)
    );

  saveEnsesBatch = async (feeds: { [string]: FeedResponse | Error }) => {
    this.props.replaceEnses(omitBy(feeds, v => v instanceof Error));
  };

  render() {
    return (
      <ScrollableTabView
        tabBarUnderlineStyle={styles.tabUnderline}
        tabBarActiveTextColor={Colors.ense.pink}
        tabBarInactiveTextColor={Colors.gray['3']}
        showsHorizontalScrollIndicator={false}
      >
        {this.props.home.sections.map(section => (
          <SectionList
            refreshControl={
              <RefreshControl
                refreshing={get(this.state, ['refreshing', section.feed.title], false)}
                onRefresh={() => this.fetchAndSave(section.feed)}
              />
            }
            key={section.feed.title}
            style={styles.container}
            tabLabel={section.feed.title}
            renderItem={this._renderItem}
            keyExtractor={item => item}
            ListEmptyComponent={EmptyListView}
            sections={[section]}
          />
        ))}
      </ScrollableTabView>
    );
  }

  _renderItem = ({ item }: { item: EnseId }) => (
    <FeedItem
      ense={this.props.home.enses[item]}
      isPlaying={item === get(this.props.currentlyPlaying, 'key')}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[0] },
  tabUnderline: { backgroundColor: Colors.ense.pink, borderRadius: 1.5, height: 3 },
});

const selector = createSelector(
  [home, feedLists, currentlyPlaying],
  (h: HomeInfo, fl: { [FeedPath]: Feed }, cp: boolean) => ({
    home: h,
    feedLists: fl,
    currentlyPlaying: cp,
  })
);
const disp = d => ({
  saveFeeds: feeds => d(saveFeedsList(feeds)),
  replaceEnses: enses => d(replaceEnses(enses)),
  updateEnses: enses => d(updateEnses(enses)),
});
export default connect<P, *, *, *, *, *>(
  selector,
  disp
)(FeedScreen);
