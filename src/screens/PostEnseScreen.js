// @flow

import React from 'react';
import { connect } from 'react-redux';
import { KeyboardAvoidingView, StyleSheet, TextInput } from 'react-native';
import type { NP } from 'utils/types';
import { Header } from 'react-native-elements';
import { SafeAreaView } from 'react-navigation';
import Colors from 'constants/Colors';
import { MainButton } from 'components/EnseButton';
import { padding } from 'constants/Layout';
import type { PublishInfo } from 'redux/ducks/run';
import { publishEnse } from 'redux/ducks/run';

type DP = { publish: (info: PublishInfo) => void };
type SP = {};
type P = DP & SP;

type S = { text: ?string };

class PostEnseScreen extends React.Component<P & NP, S> {
  static navigationOptions = { title: 'Post' };
  state = { text: null };
  _setText = (text: string) => {
    this.setState({ text });
  };
  _submit = () => {
    const { text } = this.state;
    this.props.publish({ title: text || '', unlisted: true });
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
          <MainButton style={styles.postButton} onPress={this._submit}>
            Post
          </MainButton>
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

const select = s => ({});
const dispatch = d => ({ publish: (info: PublishInfo) => d(publishEnse(info)) });

export default connect<P, *, *, *, *, *>(
  select,
  dispatch
)(PostEnseScreen);