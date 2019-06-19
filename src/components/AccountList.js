// @flow
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import Colors from 'constants/Colors';
import EmptyListView from 'components/EmptyListView';
import PublicAccount from 'models/PublicAccount';

type OP = {| accounts: PublicAccount[] |};
type SP = {||};
type DP = {||};

type P = {| ...OP, ...SP, ...DP |};

export default class AccountList extends React.Component<P> {
  componentDidMount() {}

  _renderItem = ({ item }: { item: PublicAccount }) => (
    <ListItem
      title={item.publicAccountDisplayName}
      subtitle={item.publicAccountBio}
      leftAvatar={{ source: { uri: item.publicProfileImageUrl } }}
    />
  );

  render() {
    return (
      <FlatList
        style={styles.container}
        renderItem={this._renderItem}
        keyExtractor={item => item.publicAccountId}
        data={this.props.accounts}
        ListEmptyComponent={EmptyListView}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray['0'] },
});
