// @flow

import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NLP, NP } from 'utils/types';
import { Header } from 'react-native-elements';
import AccountList from 'components/AccountList';
import Ense from 'models/Ense';
import PublicAccount from 'models/PublicAccount';
import { $get } from 'utils/api';
import routes from 'utils/api/routes';
import type { ListensPayload } from 'utils/api/types';

type OP = {||};
type NavP = {| ense: Ense |};
type P = {| ...OP, ...NLP<NavP> |};
type S = {| accounts: PublicAccount[] |};

export default class EnseListensScreen extends React.Component<P, S> {
  state = { accounts: [] };

  componentDidMount() {
    const { navigation } = this.props;
    const ense = navigation.getParam('ense');
    console.log(ense);
    $get(routes.listenersOf(ense.handle, ense.key)).then((list: ListensPayload) => {
      this.setState({ accounts: list.map(([_, a]) => PublicAccount.parse(a)) });
    });
  }
  _close = () => this.props.navigation.goBack(null);

  _leftComponent = () => ({ text: 'Close', onPress: this._close, style: styles.cancel });

  render() {
    return (
      <View style={styles.root}>
        <Header leftComponent={this._leftComponent()} containerStyle={styles.header} />
        <View style={styles.content}>
          <AccountList accounts={this.state.accounts} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'column' },
  content: { flexDirection: 'column', flex: 1 },
  header: { borderBottomWidth: 0, justifyContent: 'space-between', flexDirection: 'row' },
});
