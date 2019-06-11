// @flow
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { $post } from 'utils/api';
import routes from 'utils/api/routes';
import { saveUser, selectUser } from 'redux/ducks/auth';

type SP = {};
type DP = {
  saveUser: any => void,
};
type P = DP & SP;
class ProfileScreen extends React.Component<P> {
  static navigationOptions = { title: 'Profile' };

  async componentDidMount() {
    await this.fetchProfile();
  }

  fetchProfile = async (): Promise<any> => {
    try {
      const user = get(await $post(routes.accountInfo), 'contents');
      user && this.props.saveUser(user);
      return user;
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>This is a profile</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'yellow' },
});

const select = s => ({
  ...selectUser(s),
});
const dispatch = d => ({
  saveUser: u => d(saveUser(u)),
});

export default connect(
  select,
  dispatch
)(ProfileScreen);
