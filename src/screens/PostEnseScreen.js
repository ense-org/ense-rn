// @flow

import React from 'react';
import { Text, StyleSheet, View, TextInput, KeyboardAvoidingView } from 'react-native';
import type { NP } from 'utils/types';
import { Header } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation';
import Colors from 'constants/Colors';
import { MainButton } from 'components/EnseButton';
import { padding } from 'constants/Layout';

type P = {};

type S = { text: ?string };

export default class MyProfileScreen extends React.Component<P & NP, S> {
  static navigationOptions = { title: 'Post' };
  state = { text: null };
  _setText = (text: string) => {
    this.setState({ text });
  };
  render() {
    const { navigation } = this.props;
    return (
      <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column' }} behavior="height">
        <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
          <Header
            barStyle="light-content"
            backgroundColor={Colors.gray['5']}
            leftComponent={{
              text: 'Cancel',
              style: { color: 'white' },
              onPress: () => {
                navigation.goBack(null);
              },
            }}
            centerComponent={{ text: 'Post', style: { color: 'white' } }}
          />
          <TextInput
            multiline
            autoFocus
            onChangeText={this._setText}
            value={this.state.text}
            style={styles.textInput}
            placeholder="Write a caption"
          />
          <MainButton style={styles.postButton}>Post</MainButton>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flexDirection: 'column', flex: 1 },
  textInput: { flex: 1, padding, marginTop: padding },
  postButton: { borderRadius: 0, padding },
});
