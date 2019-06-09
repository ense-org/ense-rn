// @flow
import React from 'react';
import Swiper from 'react-native-swiper';
import Constants from 'expo-constants';
import { View, Button, StyleSheet, Text, TextInput, KeyboardAvoidingView } from 'react-native';
import { type NavigationState, type NavigationScreenProp, Header } from 'react-navigation';
import { Main } from 'navigation/keys';
import { halfPad, marginTop, padding, largePad, large } from 'constants/Layout';
import Colors from 'constants/Colors';

type NP = { navigation: NavigationScreenProp<NavigationState> };
type P = NP;
type S = { phone: ?string, code: ?string };

class SignInScreen extends React.Component<P, S> {
  static navigationOptions = {
    title: 'Sign Up or Sign In',
  };

  state = { phone: '', code: '' };

  _validatePhone = () => (this.state.phone || '').length === 10;

  render() {
    const phoneValid = this._validatePhone();
    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Header.HEIGHT + Constants.statusBarHeight}
      >
        <Swiper loop={false} activeDotColor={Colors.ense.pink} scrollEnabled={phoneValid}>
          <View style={styles.container}>
            <Text style={styles.header}>Enter your phone number</Text>
            <Text style={styles.explain}>
              We&lsquo;ll send you a code that you can use to sign in to your account.
            </Text>
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
            <Button
              style={styles.button}
              title="Next"
              onPress={this._signInAsync}
              disabled={!phoneValid}
            />
          </View>
          <View style={styles.container}>
            <Text style={styles.header}>Confirm Code</Text>
            <View style={styles.telContainer}>
              <TextInput
                onChangeText={code => this.setState({ code })}
                value={this.state.code}
                style={styles.phoneInput}
                placeholder="Code"
                keyboardType="phone-pad"
              />
            </View>
            <Button title="Confirm" onPress={this._signInAsync} />
          </View>
        </Swiper>
      </KeyboardAvoidingView>
    );
  }

  _signInAsync = async () => {
    this.props.navigation.navigate(Main.tabs);
  };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    padding,
  },
  keyboardAvoid: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    flex: 1,
  },
  header: {
    textTransform: 'uppercase',
    marginTop,
    fontWeight: 'bold',
  },
  explain: {
    marginTop,
    textAlign: 'center',
  },
  telContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 16,
  },
  countryCode: {
    marginRight: padding,
    fontWeight: 'bold',
    fontSize: large,
  },
  phoneInput: {
    fontSize: large,
  },
  button: {
    fontSize: 40,
  },
});

export default SignInScreen;
