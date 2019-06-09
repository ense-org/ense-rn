// @flow
import React from 'react';
import { View, Button, StyleSheet, Text, TextInput } from 'react-native';
import { type NavigationState, type NavigationScreenProp } from 'react-navigation';
import { Main } from 'navigation/keys';
import { halfPad, marginTop, padding, largePad } from 'constants/Layout';

type NP = { navigation: NavigationScreenProp<NavigationState> };
type P = NP;
type S = { phone: ?string };

class SignInScreen extends React.Component<P, S> {
  static navigationOptions = {
    title: 'Sign Up or Sign In',
  };
  state = {
    phone: '',
  };
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Enter your phone number</Text>
        <View style={styles.telContainer}>
          <Text style={styles.countryCode}>+1</Text>
          <TextInput
            onChangeText={phone => this.setState({ phone })}
            value={this.state.phone}
            style={styles.phoneInput}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            autoCompleteType="tel"
            textContentType="telephoneNumber"
          />
        </View>
        <Button title="Next" onPress={this._signInAsync} />
      </View>
    );
  }

  _signInAsync = async () => {
    this.props.navigation.navigate(Main.tabs);
  };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding,
  },
  header: {
    textTransform: 'uppercase',
    alignSelf: 'center',
    marginTop,
  },
  telContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: largePad,
  },
  countryCode: {
    marginRight: halfPad,
    fontWeight: 'bold',
  },
  phoneInput: {},
});

export default SignInScreen;
