// @flow
import * as React from 'react';
import { withNavigation } from 'react-navigation';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { Avatar, ListItem } from 'react-native-elements';
import Colors from 'constants/Colors';
import EmptyListView from 'components/EmptyListView';
import PublicAccount from 'models/PublicAccount';
import { pubProfile } from 'navigation/keys';
import type { NP } from 'utils/types';
import { fontSize, halfPad, regular } from 'constants/Layout';

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
    <PublicAccountRow item={item} onItem={this._onItem} />
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

export const PublicAccountRow = ({
  item,
  onItem,
}: {
  item: PublicAccount,
  onItem: PublicAccount => void,
}) => {
  const title = (
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
  );

  const leftAvatar = (
    <View>
      <Avatar
        rounded
        source={{ uri: item.publicProfileImageUrl }}
        title={(item.publicAccountDisplayName || '')[0]}
      />
      <Text style={styles.reaction}>{item.publicAccountExtraInfo || ''}</Text>
    </View>
  );

  const subTitle = item.publicAccountBio && (
    <Text style={styles.bio} numberOfLines={1}>
      {item.publicAccountBio}
    </Text>
  );
  return (
    <ListItem
      title={title}
      leftAvatar={leftAvatar}
      onPress={() => onItem(item)}
      subtitle={subTitle}
      subtitleProps={{ numberOfLines: 1 }}
      underlayColor={Colors.gray['1']}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  titleContainer: { flexDirection: 'row', marginBottom: 4 },
  handle: { color: Colors.gray['4'], marginLeft: halfPad },
  bio: { color: Colors.gray['4'] },
  name: { fontWeight: 'bold', fontSize },
  reaction: { position: 'absolute', right: -12, bottom: -8, fontSize: regular },
});

// $FlowFixMe
export default withNavigation(AccountList);
