// @flow

import React from 'react';
import { get, zipObject, omitBy } from 'lodash';
import { createSelector } from 'redux-starter-kit';
import { SectionList, StyleSheet, RefreshControl, Text, View } from 'react-native';
import { ScrollableTabView } from 'components/vendor/ScrollableTabView';
import { connect } from 'react-redux';
import { $get, routes } from 'utils/api';
import {
  saveFeedsList,
  replaceEnses,
  updateEnses,
  feedLists,
  home as homeR,
} from 'redux/ducks/feed';
import Feed from 'models/Feed';
import Colors from 'constants/Colors';
import type { FeedResponse, FeedJSON, TrendingTopics, FeedPath } from 'utils/api/types';
import type { EnseGroups, HomeInfo, HomeSection, SelectedFeedLists } from 'redux/ducks/feed';
import EmptyListView from 'components/EmptyListView';
import type { EnseId } from 'models/types';
import { currentlyPlaying } from 'redux/ducks/run';
import User from 'models/User';
import Ense from 'models/Ense';
import { padding, small } from 'constants/Layout';
import ScrollableTabBar from 'components/vendor/ScrollableTabView/ScrollableTabBar';
import FeedItem from 'components/FeedItem';

type SP = {| home: HomeInfo, ...SelectedFeedLists, currentlyPlaying: ?Ense, user: ?User |};
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
    this.refreshAll();
  }

  componentDidUpdate(prev: P) {
    const id = get(this.props.user, 'id');
    if (id && get(prev.user, 'id') !== id) {
      this.refreshAll();
    }
  }

  refreshAll = () =>
    this.fetchFeeds()
      .then(this.fetchEnsesBatch)
      .then(this.saveEnsesBatch);

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
    const {
      home: { sections },
    } = this.props;
    if (!sections.length) {
      return <EmptyListView />;
    }
    return (
      <ScrollableTabView
        style={{ backgroundColor: Colors.gray['0'] }}
        tabBarUnderlineStyle={styles.tabUnderline}
        tabBarActiveTextColor={Colors.ense.pink}
        tabBarInactiveTextColor={Colors.gray['3']}
        tabBarBackgroundColor="white"
        showsHorizontalScrollIndicator={false}
        renderTabBar={sections.length > 3 ? this._scrollableTabs : undefined}
      >
        {sections.map(section => (
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
            stickySectionHeadersEnabled={false}
            renderSectionHeader={this._renderSectionHeader}
            keyExtractor={item => item}
            ListEmptyComponent={EmptyListView}
            sections={section.data.length ? [section] : []}
          />
        ))}
      </ScrollableTabView>
    );
  }

  _renderSectionHeader = ({ section }: { section: HomeSection }) => {
    const subtitle = get(section, 'feed.subtitle');
    if (subtitle) {
      return (
        <View style={styles.sectionHeadWrap}>
          <Text style={styles.sectionHead}>{subtitle}</Text>
        </View>
      );
    }
    return null;
  };

  _renderItem = ({ item }: { item: EnseId }) => (
    <FeedItem
      ense={this.props.home.enses[item]}
      isPlaying={item === get(this.props.currentlyPlaying, 'key')}
    />
  );

  _scrollableTabs = () => <ScrollableTabBar />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray['0'] },
  tabUnderline: { backgroundColor: Colors.ense.pink, borderRadius: 2, height: 3 },
  sectionHeadWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ense.midnight,
  },
  sectionHead: { color: Colors.gray['1'], padding, flex: 1, fontSize: small, fontWeight: 'bold' },
});

const selector = createSelector(
  [homeR, feedLists, currentlyPlaying, 'auth.user'],
  (h: HomeInfo, fl: { [FeedPath]: Feed }, cp: boolean, user: ?User) => ({
    home: h,
    feedLists: fl,
    currentlyPlaying: cp,
    user,
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
