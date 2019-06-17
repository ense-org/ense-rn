// @flow
import React from 'react';
import { connect } from 'react-redux';
import Constants from 'expo-constants';
import Swiper from 'react-native-swiper';
import { View, StyleSheet, Text, TextInput, KeyboardAvoidingView } from 'react-native';
import { MainButton as Button, SecondaryButton } from 'components/EnseButton';
import { SafeAreaView, Header } from 'react-navigation';
import { profileStack } from 'navigation/keys';
import {
  marginTop,
  padding,
  large,
  paddingHorizontal,
  marginBottom,
  deviceW,
  triplePad,
} from 'constants/Layout';
import Colors from 'constants/Colors';
import { $post } from 'utils/api';
import routes from 'utils/api/routes';
import { setSessioned } from 'redux/ducks/auth';
import Spacer from 'components/Spacer';
import type { NP } from 'utils/types';

type Screen = 'phone' | 'code';
type DP = { setSessioned: () => void };
type OP = {};
type P = OP & DP;
type S = { phone: ?string, code: ?string, screen: Screen, sendCode: boolean };

class SignInScreen extends React.Component<P & NP, S> {
  static navigationOptions = { title: 'Sign Up or Sign In' };
  state = { phone: '', code: '', screen: 'phone', sendCode: true };

  render() {
    const phoneValid = this._validatePhone();
    return (
      <KeyboardAvoidingView
        behavior="height"
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Header.HEIGHT}
      >
        {this._enterPhone(phoneValid)}
        {this._enterCode()}
      </KeyboardAvoidingView>
    );
  }

  _cleanPhone = () => (this.state.phone || '').replace(/[\s-()]/g, '');
  _validLen = (s: string) => s.length === 10;
  _validatePhone = () => this._validLen(this._cleanPhone());
  _validateCode = () => (this.state.code || '').length === 6;
  _setPhone = (phone: ?string) => this.setState({ phone, sendCode: true });
  _setCode = (code: ?string) => this.setState({ code });

  _enterPhone = (phoneValid: boolean) =>
    this.state.screen === 'phone' && (
      <View style={styles.container}>
        <Text style={styles.header}>Enter your phone number</Text>
        <Text style={styles.explain}>
          We&lsquo;ll send you a code that you can use to sign in to your account.
        </Text>
        <View style={styles.telContainer}>
          <Text style={styles.countryCode}>+1</Text>
          <TextInput
            onChangeText={this._setPhone}
            value={formatPhone(this.state.phone)}
            style={styles.textInput}
            placeholder="555 234-9876"
            keyboardType="phone-pad"
            autoCompleteType="tel"
            returnKeyType="done"
            textContentType="telephoneNumber"
          />
        </View>
        <Spacer />
        <Button style={styles.button} onPress={this._submitPhone} disabled={!phoneValid}>
          {phoneValid ? 'Next' : ''}
        </Button>
      </View>
    );

  _enterCode = () => {
    const codeValid = this._validateCode();
    return (
      this.state.screen === 'code' && (
        <View style={styles.container}>
          <Text style={styles.header}>Confirm Code</Text>
          <Text style={styles.explain}>We sent you a code via SMS, enter it here.</Text>
          <View style={styles.telContainer}>
            <TextInput
              onChangeText={this._setCode}
              value={this.state.code}
              style={[styles.textInput, { textAlign: 'center' }]}
              placeholder="SMS Code"
              returnKeyType="done"
              keyboardType="numeric"
            />
          </View>
          <SecondaryButton onPress={this._toPhone}>re-enter phone</SecondaryButton>
          <Spacer />
          <Button style={styles.button} onPress={this._submitCode} disabled={!codeValid}>
            Confirm
          </Button>
        </View>
      )
    );
  };

  _toPhone = () => this.setState({ screen: 'phone', sendCode: false });

  _submitPhone = async () => {
    const { sendCode } = this.state;
    const phone = this._cleanPhone();
    if (!this._validLen(phone)) return;
    try {
      if (sendCode) {
        await $post(routes.smsVerifyRequest, { phoneNumber: `+1${phone}` });
      }
      this.setState({ screen: 'code' });
    } catch (err) {
      // TODO handle this in UI
      console.error(err);
    }
  };

  _submitCode = async () => {
    if (!this.state.phone) return;
    try {
      const phone = this._cleanPhone();
      if (!this._validLen(phone)) return;
      const confirmCode = this.state.code;
      await $post(routes.smsVerifyConfirm, { phoneNumber: `+1${phone}`, confirmCode });
      this.props.setSessioned();
      const parent = this.props.navigation.dangerouslyGetParent();
      parent && parent.navigate(profileStack.key);
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
  swiper: {},
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
    fontSize: large,
  },
  textInput: {
    fontSize: large,
    minWidth: 154,
    maxWidth: Math.max(154, deviceW - 120),
  },
  button: {
    marginTop,
    marginBottom: triplePad,
  },
});

function formatPhone(partial: ?string) {
  if (!partial) return '';
  let phone = partial.replace(/\D/g, '');
  const match = phone.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    phone = `${match[1]}${match[2] ? ' ' : ''}${match[2]}${match[3] ? '-' : ''}${match[3]}`;
  }
  return phone;
}

// eslint-disable-next-line no-undef
export default connect<P, OP, *, *, *, *>(
  null,
  d => ({ setSessioned: () => d(setSessioned(true)) })
)(SignInScreen);
