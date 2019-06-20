// @flow
import React from 'react';
import { withNavigation } from 'react-navigation';
import { FlatList, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import Colors from 'constants/Colors';
import EmptyListView from 'components/EmptyListView';
import PublicAccount from 'models/PublicAccount';
import { pubProfile } from 'navigation/keys';
import type { NP } from 'utils/types';

type OP = {| accounts: PublicAccount[] |};
type P = {| ...OP, ...NP |};

class AccountList extends React.Component<P> {
  _onItem = (item: PublicAccount) => {
    const { navigation } = this.props;
    navigation.push &&
      navigation.push(pubProfile.key, {
        userHandle: item.publicAccountHandle,
        userId: item.publicAccountId,
      });
  };

  _renderItem = ({ item }: { item: PublicAccount }) => (
    <ListItem
      title={item.publicAccountDisplayName}
      subtitle={item.publicAccountBio}
      leftAvatar={{ source: { uri: item.publicProfileImageUrl } }}
      onPress={() => this._onItem(item)}
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

export default withNavigation(AccountList);
