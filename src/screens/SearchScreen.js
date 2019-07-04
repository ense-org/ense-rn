// @flow
import React from 'react';
import { SearchBar } from 'react-native-elements';
import { debounce } from 'lodash';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import Colors from 'constants/Colors';
import type { Topic, TrendingTopics } from 'utils/api/types';
import routes from 'utils/api/routes';
import { $get } from 'utils/api';
import { defaultText } from 'constants/Styles';
import FeedItem from 'components/FeedItem';
import { PublicAccountRow } from 'components/AccountList';
import { halfPad, padding, paddingHorizontal } from 'constants/Layout';
import Ense from 'models/Ense';
import PublicAccount from 'models/PublicAccount';

type P = {};
type S = { query: string, trending: Topic[], results: Section[] };
type ResultType = 'user' | 'topic' | 'ense';
type Section = { data: any[], title: string, type: ResultType };

export default class SearchScreen extends React.Component<P, S> {
  state = { query: '', trending: [], results: [] };

  static navigationOptions = { title: 'search' };

  componentDidMount() {
    this._fetchTrending();
  }

  _setTrending = (r: TrendingTopics) => this.setState({ trending: r.topiclist || [] });
  _fetchTrending = () => $get(routes.trendingTopics).then(this._setTrending);

  _runSearch = debounce((query: string) => {
    Promise.all([
      $get(routes.searchTopics(query)),
      $get(routes.searchUsers(query)),
      $get(routes.searchEnses(query)),
    ]).then(([topics, users, ense]) => {
      const results = [
        { title: 'Tags', data: topics.topiclist, type: 'topic' },
        { title: 'People', data: users.map(([_, u]) => PublicAccount.parse(u)), type: 'user' },
        { title: 'Enses', data: ense.enses.map(([_, e]) => Ense.parse(e)), type: 'ense' },
      ];
      this.setState({ results });
    });
  }, 250);

  render() {
    const { trending, query, results } = this.state;
    const sections: Section[] = query
      ? results
      : [{ title: 'Trending', data: trending, type: 'topic' }];
    return (
      <View style={styles.root}>
        {this._listHeader()}
        <SectionList
          style={styles.container}
          renderItem={this._renderItem}
          renderSectionHeader={this._renderSectionHeader}
          stickySectionHeadersEnabled
          keyExtractor={(item, index) => index}
          sections={sections}
        />
      </View>
    );
  }

  _setQuery = (query: string) => {
    this.setState({ query });
    this._runSearch(query);
  };

  _listHeader = () => (
    <SearchBar
      placeholder="topics, people, & sounds..."
      onChangeText={this._setQuery}
      value={this.state.query}
      lightTheme
      containerStyle={styles.searchContainer}
      inputContainerStyle={styles.searchInput}
    />
  );

  _renderSectionHeader = ({ section }: { section: Section }) => {
    return <SectionHeader title={section.title} />;
  };

  _renderItem = ({ item, section }: { item: any, section: Section }) => {
    if (section.type === 'ense') {
      return <FeedItem ense={item} isPlaying={false} />;
    } else if (section.type === 'topic') {
      return <TopicResult topic={item} />;
    } else if (section.type === 'user') {
      return <PublicAccountRow item={item} onItem={() => {}} />;
    }
    return null;
  };
}

const TopicResult = ({ topic }: { topic: Topic }) => (
  <Text style={styles.topicResult}>#{topic.displayname}</Text>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flexDirection: 'column', flex: 1 },
  container: { flex: 1 },
  searchContainer: { backgroundColor: 'white' },
  searchInput: { backgroundColor: Colors.gray['0'] },
  sectionHeader: { backgroundColor: Colors.gray['0'], paddingHorizontal, paddingVertical: halfPad },
  sectionHeaderText: { ...defaultText },
  topicResult: { padding, color: Colors.ense.actionblue, paddingVertical: halfPad },
});
