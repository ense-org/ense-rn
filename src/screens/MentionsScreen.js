// @flow

import React from 'react';
import { get, zipObject, omitBy } from 'lodash';
import { createSelector } from 'redux-starter-kit';
import { SectionList, StyleSheet, RefreshControl } from 'react-native';
import { ScrollableTabView } from 'components/vendor/ScrollableTabView';
import { connect } from 'react-redux';
import { $get, routes } from 'utils/api';
import { replaceMentions, updateMentions, mentions } from 'redux/ducks/feed';
import Colors from 'constants/Colors';
import type { FeedResponse } from 'utils/api/types';
import EmptyListView from 'components/EmptyListView';
import type { EnseId } from 'models/types';
import { currentlyPlaying } from 'redux/ducks/run';
import User from 'models/User';
import Ense from 'models/Ense';
import { padding, small } from 'constants/Layout';
import FeedItem from 'components/FeedItem';

type MentionsInfo = {|
  lists: { [string]: EnseId[] },
  enses: { [EnseId]: Ense },
|};
type SP = {|
  ...MentionsInfo,
  currentlyPlaying: ?Ense,
  user: ?User,
|};
type DP = {|
  replaceMentions: ({ [string]: FeedResponse }) => void,
  updateMentions: ({ [string]: FeedResponse }) => void,
|};
type P = {| ...DP, ...SP |};
type S = { refreshing: { [string]: boolean } };

type Tab = {
  title: string,
  url: string,
  params?: Object,
  transform?: any => FeedResponse,
};

const allTabs: Tab[] = [
  { title: 'All', url: routes.mentionsMe },
  {
    title: 'Unheard',
    url: routes.inbox,
    params: { count: 50, type: 'AT_TAG', unread: 'True' },
    transform: (r: any) => ({
      enses: get(r, 'notifications', []).map(n => [n.nEnse.key, n.nEnse]),
      remoteTotal: get(r, 'totalCount'),
    }),
  },
];

class MentionsScreen extends React.Component<P, S> {
  static navigationOptions = { title: 'mentions' };
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

  refreshAll = () => this.fetchEnsesBatch(allTabs).then(this.saveEnsesBatch);

  fetchAndSave = (tab: Tab) => {
    this._setRefreshing(tab, true);
    this.fetchEnsesBatch([tab])
      .then(this.props.updateMentions)
      .finally(() => this._setRefreshing(tab, false));
  };

  _setRefreshing = (tab: Tab, refreshing: boolean) =>
    this.setState(s => ({ refreshing: { ...s.refreshing, [tab.title]: refreshing } }));

  fetchEnses = async (forTab: Tab) =>
    $get(forTab.url, forTab.params)
      .then(forTab.transform ? forTab.transform : r => r)
      .catch(e => e);

  fetchEnsesBatch = async (forTab: Tab[]) =>
    Promise.all(forTab.map(this.fetchEnses)).then(responses =>
      zipObject(forTab.map(f => f.url), responses)
    );

  saveEnsesBatch = async (tabs: { [string]: FeedResponse | Error }) => {
    this.props.replaceMentions(omitBy(tabs, v => v instanceof Error));
  };

  render() {
    const { lists } = this.props;
    return (
      <ScrollableTabView
        style={{ backgroundColor: Colors.gray['0'] }}
        tabBarUnderlineStyle={styles.tabUnderline}
        tabBarActiveTextColor={Colors.ense.pink}
        tabBarInactiveTextColor={Colors.gray['3']}
        tabBarBackgroundColor="white"
        showsHorizontalScrollIndicator={false}
      >
        {allTabs.map(tab => (
          <SectionList
            refreshControl={
              <RefreshControl
                refreshing={get(this.state, ['refreshing', tab.title], false)}
                onRefresh={() => this.fetchAndSave(tab)}
              />
            }
            key={tab.url}
            style={styles.container}
            tabLabel={tab.title}
            renderItem={this._renderItem}
            keyExtractor={item => item}
            ListEmptyComponent={EmptyListView}
            sections={[{ data: get(lists, tab.url, []) }]}
          />
        ))}
      </ScrollableTabView>
    );
  }

  _renderItem = ({ item }: { item: EnseId }) => (
    <FeedItem
      ense={this.props.enses[item]}
      isPlaying={item === get(this.props.currentlyPlaying, 'key')}
    />
  );
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
  [mentions, currentlyPlaying, 'auth.user'],
  (mi: MentionsInfo, cp: boolean, user: ?User) => ({
    ...mi,
    currentlyPlaying: cp,
    user,
  })
);
const disp = d => ({
  replaceMentions: enses => d(replaceMentions(enses)),
  updateMentions: enses => d(updateMentions(enses)),
});
export default connect<P, *, *, *, *, *>(
  selector,
  disp
)(MentionsScreen);
