// @flow
import * as React from 'react';
import { withNavigation } from 'react-navigation';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { ListItem } from 'react-native-elements';
import Colors from 'constants/Colors';
import EmptyListView from 'components/EmptyListView';
import PublicAccount from 'models/PublicAccount';
import { pubProfile } from 'navigation/keys';
import type { NP } from 'utils/types';
import { fontSize, halfPad } from 'constants/Layout';

type OP = {|
  accounts: PublicAccount[],
  listHeader?: React.Node,
  onSelect?: PublicAccount => void,
|};
type P = {| ...OP, ...NP |};

class AccountList extends React.Component<P> {
  static defaultProps = { listHeader: null };
  _onItem = (item: PublicAccount) => {
    const { navigation, onSelect } = this.props;
    onSelect && onSelect(item);
    navigation.push &&
      navigation.push(pubProfile.key, {
        userHandle: item.publicAccountHandle,
        userId: item.publicAccountId,
      });
  };

  _renderItem = ({ item }: { item: PublicAccount }) => (
    <ListItem
      // title={item.publicAccountDisplayName}
      title={
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {item.publicAccountDisplayName || 'anonymous'}
          </Text>
          {item.publicAccountHandle && (
            <Text style={styles.handle} numberOfLines={1}>
              @{item.publicAccountHandle}
            </Text>
          )}
        </View>
      }
      leftAvatar={{
        source: { uri: item.publicProfileImageUrl },
        title: (item.publicAccountDisplayName || '')[0],
      }}
      onPress={() => this._onItem(item)}
      subtitle={
        item.publicAccountBio && (
          <Text style={styles.bio} numberOfLines={1}>
            {item.publicAccountBio}
          </Text>
        )
      }
      subtitleProps={{ numberOfLines: 1 }}
      underlayColor={Colors.gray['1']}
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
        ListHeaderComponent={this.props.listHeader}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleContainer: { flexDirection: 'row', marginBottom: 4 },
  handle: { color: Colors.gray['4'], marginLeft: halfPad },
  bio: { color: Colors.gray['4'] },
  name: { fontWeight: 'bold', fontSize },
});

// $FlowFixMe
export default withNavigation(AccountList);
