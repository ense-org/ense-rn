// @flow
import React from 'react';
import { connect } from 'react-redux';
import { get, reverse } from 'lodash';
import { SectionList, StyleSheet } from 'react-native';
import Ense from 'models/Ense';
import type { NLP } from 'utils/types';
import FeedItem from 'components/FeedItem';
import { currentlyPlaying } from 'redux/ducks/run';
import { $get } from 'utils/api';
import EmptyListView from 'components/EmptyListView';
import type { EnseId, FeedResponse } from 'utils/api/types';
import ExpandedFeedItem from 'components/ExpandedFeedItem';

export type EnseUrlScreenParams = {|
  url: string,
  title: string,
  reverse?: boolean,
  highlight?: EnseId[],
|};
type NP = NLP<EnseUrlScreenParams>;
type SP = {| playing: ?Ense |};
type DP = {||};
type P = {| ...DP, ...SP, ...NP |};
type S = {| enses: Ense[] |};

/**
 * Basic ense list screen, e.g. a screen showing enses for a hashtag, search result,
 * conversation, etc. The implicit contract here is that the url that is passed via
 * navigation props yields a {@link FeedResponse}
 *
 */
class EnseUrlScreen extends React.Component<P, S> {
  state = { enses: [] };

  static navigationOptions = ({ navigation }: NP) => ({
    title: navigation.getParam('title', 'enses'),
  });

  _setEnses = (r: FeedResponse) => {
    const parsed = r.enses.map(([_, json]) => Ense.parse(json));
    const rev = this.props.navigation.getParam('reverse', false);
    this.setState({ enses: rev ? reverse(parsed) : parsed });
  };

  componentDidMount() {
    const url = this.props.navigation.getParam('url');
    url && $get(url).then(this._setEnses);
  }

  render() {
    const { enses } = this.state;
    return (
      <SectionList
        style={styles.container}
        renderItem={this._renderItem}
        keyExtractor={(item, index) => index}
        sections={enses.length ? [{ data: enses }] : []}
        ListEmptyComponent={EmptyListView}
      />
    );
  }

  _renderItem = ({ item }: { item: Ense }) => {
    const expanded = this.props.navigation.getParam('highlight') || [];
    return expanded.includes(item.key) ? (
      <ExpandedFeedItem ense={item} isPlaying={item.key === get(this.props, 'playing.key')} />
    ) : (
      <FeedItem ense={item} isPlaying={item.key === get(this.props, 'playing.key')} hideThreads />
    );
  };
}
const styles = StyleSheet.create({ container: { flex: 1 } });

export default connect<P, *, *, *, *, *>(s => ({ playing: currentlyPlaying(s) }))(EnseUrlScreen);
