import React from 'react';
import { connect } from 'react-redux';
import { View, Button, StyleSheet } from 'react-native';
import nav from 'navigation';
import { $get } from 'utils/api';

class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'Please sign in',
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Sign in!" onPress={this._signInAsync} />
      </View>
    );
  }

  _signInAsync = async () => {
    console.log('press');
    $get('/').then(r => console.log('finished', r));
    this.props.navigation.navigate(nav.tabs);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SignInScreen;
