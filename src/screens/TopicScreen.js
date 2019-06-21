// @flow
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { SectionList, StyleSheet } from 'react-native';
import Ense from 'models/Ense';
import type { NLP } from 'utils/types';
import FeedItem from 'screens/FeedScreen/FeedItem';
import { currentlyPlaying } from 'redux/ducks/run';
import { $get } from 'utils/api';
import routes from 'utils/api/routes';
import EmptyListView from 'components/EmptyListView';
import type { FeedResponse } from 'utils/api/types';

type NP = NLP<{| topic: string |}>;
type SP = {| playing: ?Ense |};
type DP = {||};
type P = {| ...DP, ...SP, ...NP |};
type S = {| enses: Ense[] |};
class TopicScreen extends React.Component<P, S> {
  state = { enses: [] };

  static navigationOptions = ({ navigation }: NP) => ({
    title: `#${navigation.getParam('topic', 'topic')}`,
  });

  _setEnses = (r: FeedResponse) =>
    this.setState({ enses: r.enses.map(([_, json]) => Ense.parse(json)) });

  componentDidMount() {
    const topic = this.props.navigation.getParam('topic');
    topic && $get(routes.topic(topic)).then(this._setEnses);
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

  _renderItem = ({ item }: { item: Ense }) => (
    <FeedItem ense={item} isPlaying={item.key === get(this.props, 'playing.key')} />
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default connect<P, *, *, *, *, *>(s => ({ playing: currentlyPlaying(s) }))(TopicScreen);
