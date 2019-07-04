// @flow
import React from 'react';
import { SearchBar } from 'react-native-elements';
import { debounce } from 'lodash';
import { SectionList, StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import Colors from 'constants/Colors';
import type { Topic, TrendingTopics } from 'utils/api/types';
import routes from 'utils/api/routes';
import { $get } from 'utils/api';
import { defaultText, largeText } from 'constants/Styles';
import FeedItem from 'components/FeedItem';
import { PublicAccountRow } from 'components/AccountList';
import { halfPad, padding, paddingHorizontal } from 'constants/Layout';
import Ense from 'models/Ense';
import PublicAccount from 'models/PublicAccount';
import { enseUrlList, pubProfile } from 'navigation/keys';
import type { EnseUrlScreenParams as EUSP } from 'screens/EnseUrlScreen';
import type { NP } from 'utils/types';

type P = {| ...NP |};
type S = { query: string, trending: Topic[], results: Section[] };
type ResultType = 'user' | 'topic' | 'ense';
type Section = { data: any[], title: string, type: ResultType };

export default class SearchScreen extends React.Component<P, S> {
  static navigationOptions = { title: 'search' };
  state = { query: '', trending: [], results: [] };

  componentDidMount() {
    this._fetchTrending();
  }

  _onUser = (item: PublicAccount) => {
    const { navigation } = this.props;
    navigation.push &&
      navigation.push(pubProfile.key, {
        userHandle: item.publicAccountHandle,
        userId: item.publicAccountId,
      });
  };

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

  _pushEnseScreen = (params: EUSP) => {
    const { navigation } = this.props;
    // $FlowIgnore - we can do better nav typing eventually
    typeof navigation.push === 'function' && navigation.push(enseUrlList.key, params);
  };

  _onTopic = (tag: string) => {
    this._pushEnseScreen({ title: tag, url: routes.topic(tag.replace(/^#/, '')) });
  };

  _renderItem = ({ item, section }: { item: any, section: Section }) => {
    if (section.type === 'ense') {
      return <FeedItem ense={item} isPlaying={false} />;
    } else if (section.type === 'topic') {
      return this._tagResult(item);
    } else if (section.type === 'user') {
      return <PublicAccountRow item={item} onItem={this._onUser} />;
    }
    return null;
  };

  _tagResult = (topic: Topic) => (
    <TouchableHighlight
      onPress={() => this._onTopic(topic.displayname)}
      underlayColor={Colors.gray['0']}
    >
      <Text style={styles.topicResult}>#{topic.displayname}</Text>
    </TouchableHighlight>
  );
}

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={largeText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flexDirection: 'column', flex: 1 },
  container: { flex: 1 },
  searchContainer: { backgroundColor: 'white' },
  searchInput: { backgroundColor: Colors.gray['0'] },
  sectionHeader: { backgroundColor: 'white', paddingHorizontal, paddingVertical: halfPad },
  sectionHeaderText: { ...defaultText },
  topicResult: { padding, color: Colors.ense.actionblue, paddingVertical: halfPad },
});
