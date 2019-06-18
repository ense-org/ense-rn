// @flow

import React from 'react';
import { connect } from 'react-redux';
import { KeyboardAvoidingView, StyleSheet, TextInput } from 'react-native';
import type { NP } from 'utils/types';
import { Header } from 'react-native-elements';
import Colors from 'constants/Colors';
import { MainButton } from 'components/EnseButton';
import { padding } from 'constants/Layout';
import type { PublishInfo } from 'redux/ducks/run';
import { cancelRecording, publishEnse } from 'redux/ducks/run';
import type { Dispatch, State } from 'redux/types';
import RecorderBar from 'components/audioStatus/RecorderBar';

type DP = {| publish: (info: PublishInfo) => Promise<any>, cancel: () => Promise<any> |};
type P = {| ...DP, ...NP |};

type S = { text: ?string };

class PostEnseScreen extends React.Component<P, S> {
  static navigationOptions = { title: 'Post' };
  state = { text: null };

  _setText = (text: string) => this.setState({ text });
  _close = () => this.props.cancel().then(() => this.props.navigation.goBack(null));
  _leftComponent = () => ({ text: 'Cancel', style: { color: 'white' }, onPress: this._close });

  _submit = () => {
    const { text } = this.state;
    this.props.publish({ title: text || '', unlisted: false }).then(this._close);
  };

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column' }} behavior="padding">
        <Header
          barStyle="light-content"
          backgroundColor={Colors.gray['5']}
          leftComponent={this._leftComponent()}
          centerComponent={{ text: 'Post', style: { color: 'white' } }}
        />
        <TextInput
          multiline
          autoFocus
          onChangeText={this._setText}
          value={this.state.text}
          style={styles.textInput}
          returnKeyType="done"
          placeholder="Write a caption"
        />
        <RecorderBar />
        <MainButton style={styles.postButton} onPress={this._submit}>
          Post
        </MainButton>
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
const dispatch = (d: Dispatch): DP => ({
  publish: (info: PublishInfo) => d(publishEnse(info)),
  cancel: () => d(cancelRecording),
});

export default connect<P, *, *, DP, State, Dispatch>(
  select,
  dispatch
)(PostEnseScreen);
