// @flow

import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { KeyboardAvoidingView, StyleSheet, TextInput, View, Image } from 'react-native';
import type { NP } from 'utils/types';
import { CheckBox, Header } from 'react-native-elements';
import Colors from 'constants/Colors';
import { MainButton } from 'components/EnseButton';
import { halfPad, marginLeft, marginTop, padding } from 'constants/Layout';
import type { PublishInfo } from 'redux/ducks/run';
import { cancelRecording, publishEnse } from 'redux/ducks/run';
import type { Dispatch, State } from 'redux/types';
import RecorderBar from 'components/audioStatus/RecorderBar';
import { ifiOS } from 'utils/device';
import { emptyProfPicUrl } from 'constants/Values';
import { selectUser } from 'redux/ducks/auth';
import User from 'models/User';

type DP = {| publish: (info: PublishInfo) => Promise<any>, cancel: () => Promise<any> |};
type SP = {| user: ?User |};
type P = {| ...DP, ...NP, ...SP |};

type S = {| text: ?string, unlisted: boolean |};

class PostEnseScreen extends React.Component<P, S> {
  state = { text: null, unlisted: false };

  _setText = (text: string) => this.setState({ text });
  _close = () => this.props.cancel().then(() => this.props.navigation.goBack(null));
  _leftComponent = () => ({ text: 'Cancel', onPress: this._close, style: styles.cancel });
  _rightComponent = () => (
    <MainButton style={styles.postButton} onPress={this._submit} textStyle={styles.postText}>
      ense it
    </MainButton>
  );
  _toggleUnlisted = () => this.setState(s => ({ unlisted: !s.unlisted }));

  _submit = () =>
    this.props
      .publish({ title: this.state.text || '', unlisted: this.state.unlisted })
      .then(this._close);

  render() {
    const { user } = this.props;
    const { unlisted } = this.state;
    return (
      <KeyboardAvoidingView style={styles.root} behavior="padding">
        <Header
          leftComponent={this._leftComponent()}
          containerStyle={styles.header}
          centerContainerStyle={{ flex: 0 }}
          rightComponent={this._rightComponent()}
        />
        <View style={styles.textContainer}>
          <Image
            source={{ uri: get(user, 'profpicURL', emptyProfPicUrl) }}
            style={styles.img}
            resizeMode="cover"
          />
          <TextInput
            style={styles.textInput}
            onChangeText={this._setText}
            value={this.state.text}
            returnKeyType="done"
            placeholder="What's happening?"
            keyboardType={ifiOS('twitter', 'default')}
            placeholderTextColor={Colors.gray['4']}
            multiline
            autoFocus
          />
        </View>
        <CheckBox
          title={unlisted ? 'Private' : 'Public'}
          containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
          right
          iconRight
          iconType="feather"
          checkedIcon="lock"
          uncheckedIcon="globe"
          checkedColor={Colors.gray['4']}
          uncheckedColor={Colors.ense.actionblue}
          checked={unlisted}
          onPress={this._toggleUnlisted}
        />
        <RecorderBar />
      </KeyboardAvoidingView>
    );
  }
}

const imgSize = 32;
const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'column' },
  container: { flexDirection: 'column', flex: 1 },
  textContainer: { flexDirection: 'row', flex: 1 },
  textInput: { flex: 1, padding, marginTop: 18, paddingLeft: halfPad },
  postButton: { borderRadius: 18 },
  postText: { fontWeight: 'bold' },
  img: { marginLeft, marginTop, width: imgSize, height: imgSize, borderRadius: imgSize / 2 },
  header: { borderBottomWidth: 0, justifyContent: 'space-between', flexDirection: 'row' },
  cancel: {},
});

const select = selectUser;
const dispatch = (d: Dispatch): DP => ({
  publish: (info: PublishInfo) => d(publishEnse(info)),
  cancel: () => d(cancelRecording),
});

export default connect<P, *, *, DP, State, Dispatch>(
  select,
  dispatch
)(PostEnseScreen);
