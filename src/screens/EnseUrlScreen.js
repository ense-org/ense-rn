// @flow
import React from 'react';
import { connect } from 'react-redux';
import { get, reverse } from 'lodash';
import { SectionList, StyleSheet } from 'react-native';
import Ense from 'models/Ense';
import type { NLP } from 'utils/types';
import FeedItem from 'components/FeedItem';
import { currentlyPlaying, playQueue } from 'redux/ducks/run';
import { $get } from 'utils/api';
import EmptyListView from 'components/EmptyListView';
import type { EnseId, FeedResponse } from 'utils/api/types';
import ExpandedFeedItem from 'components/ExpandedFeedItem';
import type { SectionBase } from 'react-native/Libraries/Lists/VirtualizedSectionList';

export type EnseUrlScreenParams = {|
  url: string,
  title: string,
  reverse?: boolean,
  highlight?: EnseId[],
  autoPlay?: boolean,
  getTitle?: () => Promise<string>,
|};
type NP = NLP<EnseUrlScreenParams>;
type SP = {| playing: ?Ense |};
type DP = {| playEnses: (Ense[]) => Promise<any> |};
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
    const { navigation, playEnses } = this.props;
    const parsed = r.enses.map(([_, json]) => Ense.parse(json));
    const rev = navigation.getParam('reverse', false);
    const enses = rev ? reverse(parsed) : parsed;
    if (navigation.getParam('autoPlay', false)) {
      playEnses(enses);
    }
    this.setState({ enses });
  };

  componentDidMount() {
    const { navigation } = this.props;
    const url = navigation.getParam('url');
    url && $get(url).then(this._setEnses);

    const getTitle = navigation.getParam('getTitle');
    getTitle && getTitle().then(title => title && navigation.setParams({ title }));
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

  _renderItem = ({
    item,
    index,
    section,
  }: {
    item: Ense,
    index: number,
    section: SectionBase<Ense>,
  }) => {
    const { navigation, playEnses, playing } = this.props;
    const expanded = navigation.getParam('highlight') || [];
    const onPress = () => playEnses(section.data.slice(index));
    return expanded.includes(item.key) ? (
      <ExpandedFeedItem
        ense={item}
        isPlaying={item.key === get(playing, 'key')}
        onPress={onPress}
      />
    ) : (
      <FeedItem
        ense={item}
        isPlaying={item.key === get(this.props, 'playing.key')}
        hideThreads
        onPress={onPress}
      />
    );
  };
}
const styles = StyleSheet.create({ container: { flex: 1 } });

export default connect<P, *, *, *, *, *>(
  s => ({ playing: currentlyPlaying(s) }),
  d => ({ playEnses: (enses: Ense[]) => d(playQueue(enses)) })
)(EnseUrlScreen);
