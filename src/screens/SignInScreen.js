// @flow
import React from 'react';
import { connect } from 'react-redux';
import Swiper from 'react-native-swiper';
import Constants from 'expo-constants';
import { View, StyleSheet, Text, TextInput, KeyboardAvoidingView } from 'react-native';
import Button from 'components/Button';
import { type NavigationState, type NavigationScreenProp, Header } from 'react-navigation';
import { Main } from 'navigation/keys';
import {
  marginTop,
  padding,
  large,
  regular,
  paddingHorizontal,
  marginBottom,
  deviceW,
} from 'constants/Layout';
import Colors from 'constants/Colors';
import { $post } from 'utils/api';
import routes from 'utils/api/routes';
import { setSessioned } from 'redux/ducks/auth';

type NP = { navigation: NavigationScreenProp<NavigationState> };
type DP = { setSessioned: () => void };
type P = NP & DP;
type S = { phone: ?string, code: ?string };

class SignInScreen extends React.Component<P, S> {
  swiper: ?Swiper;
  static navigationOptions = {
    title: 'Sign Up or Sign In',
  };

  state = { phone: '', code: '' };

  _validatePhone = () => (this.state.phone || '').length === 10;
  _validateCode = () => (this.state.code || '').length === 6;

  render() {
    const phoneValid = this._validatePhone();
    const codeValid = this._validateCode();
    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Header.HEIGHT + Constants.statusBarHeight}
      >
        <Swiper
          loop={false}
          activeDotColor={Colors.ense.pink}
          scrollEnabled={phoneValid}
          keyboardShouldPersistTaps="always"
          ref={(r: ?Swiper) => (this.swiper = r)}
        >
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
              textStyle={styles.buttonText}
              onPress={this._submitPhone}
              disabled={!phoneValid}
              disabledStyle={styles.buttonDisabled}
              disabledTextStyle={styles.buttonDisabledText}
            >
              Next
            </Button>
          </View>
          <View style={styles.container}>
            <Text style={styles.header}>Confirm Code</Text>
            <View style={styles.telContainer}>
              <TextInput
                onChangeText={code => this.setState({ code })}
                value={this.state.code}
                style={[styles.phoneInput, { textAlign: 'center' }]}
                placeholder="SMS Code"
                keyboardType="phone-pad"
              />
            </View>
            <Button
              style={styles.button}
              textStyle={styles.buttonText}
              onPress={this._submitCode}
              disabled={!codeValid}
              disabledStyle={styles.buttonDisabled}
              disabledTextStyle={styles.buttonDisabledText}
            >
              Confirm
            </Button>
          </View>
        </Swiper>
      </KeyboardAvoidingView>
    );
  }

  _submitPhone = async () => {
    if (!this.state.phone) return;
    try {
      const phoneNumber = `+1${this.state.phone}`;
      await $post(routes.smsVerifyRequest, { phoneNumber });
      this.swiper && this.swiper.scrollBy(1);
    } catch (err) {
      console.error(err);
      // TODO handle this in UI
    }
  };

  _submitCode = async () => {
    if (!this.state.phone) return;
    try {
      const phoneNumber = `+1${this.state.phone}`;
      const confirmCode = this.state.code;
      await $post(routes.smsVerifyConfirm, { phoneNumber, confirmCode });
      this.props.setSessioned();
      this.props.navigation.goBack(null);
    } catch (err) {
      console.error(err);
    }
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
    marginBottom,
    paddingHorizontal,
    paddingVertical: 10,
    backgroundColor: Colors.gray['0'],
    borderRadius: 3,
  },
  countryCode: {
    marginRight: padding,
    fontWeight: 'bold',
    fontSize: large,
  },
  phoneInput: {
    fontSize: large,
    minWidth: 154,
    maxWidth: Math.max(154, deviceW - 120),
  },
  button: {
    marginTop,
    backgroundColor: Colors.ense.pink,
  },
  buttonDisabled: {
    backgroundColor: 'white',
  },
  buttonDisabledText: {
    color: Colors.gray['2'],
  },
  buttonText: {
    color: 'white',
    fontSize: regular,
  },
});

export default connect(
  null,
  d => ({ setSessioned: () => d(setSessioned(true)) })
)(SignInScreen);
