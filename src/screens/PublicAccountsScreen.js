// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { NLP } from 'utils/types';
import AccountList from 'components/AccountList';
import { createSelector } from 'redux-starter-kit';
import PublicAccount from 'models/PublicAccount';

type NP = NLP<{| accounts: number[], title: string |}>;
type SP = {| publicAccounts: PublicAccount[] |};
type DP = {||};
type P = {| ...DP, ...SP, ...NP |};
type S = {||};

class PublicAccountsScreen extends React.Component<P, S> {
  static navigationOptions = ({ navigation }: NP) => ({
    title: navigation.getParam('title'),
  });

  componentDidMount() {}

  render() {
    return <AccountList accounts={this.props.publicAccounts} />;
  }
}

const getAccounts = (_: any, props: NP) => props.navigation.getParam('accounts', []);
const makeSelect = () => {
  const sel = createSelector(
    [getAccounts, 'accounts._cache'],
    (ids, cache) => ids.map(i => cache[i])
  );
  // $FlowIgnore - connect can handle this actually
  return (s, p) => ({ publicAccounts: sel(s, p) });
};

export default connect<P, *, *, *, *, *>(makeSelect)(PublicAccountsScreen);
