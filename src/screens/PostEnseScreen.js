// @flow

import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { createSelector } from 'redux-starter-kit';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';
import type { NP } from 'utils/types';
import { CheckBox, Header } from 'react-native-elements';
import Colors from 'constants/Colors';
import { MainButton } from 'components/EnseButton';
import {
  halfPad,
  marginLeft,
  marginTop,
  padding,
  paddingHorizontal,
  quarterPad,
  small,
} from 'constants/Layout';
import type { PublishInfo } from 'redux/ducks/run';
import { cancelRecording, publishEnse } from 'redux/ducks/run';
import type { Dispatch, State } from 'redux/types';
import RecorderBar from 'components/audioStatus/RecorderBar';
import { ifiOS } from 'utils/device';
import { emptyProfPicUrl } from 'constants/Values';
import { userSelector } from 'redux/ducks/auth';
import User from 'models/User';
import Ense from 'models/Ense';
import PublicAccount from 'models/PublicAccount';

type Mention = { name: ?string, handle: string };
type DP = {| publish: (info: PublishInfo) => Promise<any>, cancel: () => Promise<any> |};
type SP = {| user: ?User, inReplyTo: ?Ense, accounts: Mention[] |};
type P = {| ...DP, ...NP, ...SP |};

type S = {| text: ?string, unlisted: boolean, mentioning: boolean, mentionResults: Mention[] |};
const usersRe = /\B[@][a-z0-9_-]+/gi;
const tagsRe = /\B[#][a-z0-9_-]+/gi;
const userSearchRe = /\B@[a-z0-9_-]*/gi;
const MAX_RES = 18;

class PostEnseScreen extends React.Component<P, S> {
  input: ?TextInput;
  state = { text: null, unlisted: false, mentioning: false, mentionResults: [] };

  _onTextChange = (text: string) => {
    this.setState({ text });
    let inMention = false;
    let match;
    let curMatch;
    // eslint-disable-next-line no-cond-assign,no-undef
    while ((match = userSearchRe.exec(text))) {
      // eslint-disable-next-line no-undef
      const i = match.index + match[0].length;
      if (i === text.length) {
        inMention = true;
        curMatch = match[0];
        break;
      }
    }
    const { mentioning } = this.state;
    if (inMention !== mentioning) {
      this.setState({ mentioning: inMention });
    }
    if (inMention && curMatch && curMatch.length > 1) {
      this._filterAccounts(curMatch.slice(1).toLowerCase());
    }
  };

  _filterAccounts = (query: string) => {
    const results = [];
    for (let i = 0; i < this.props.accounts.length; i++) {
      const a = this.props.accounts[i];
      if (
        a.handle.toLowerCase().includes(query) ||
        (a.name && a.name.toLowerCase().includes(query))
      ) {
        results.push(a);
      }
      if (results.length > MAX_RES) {
        this.setState({ mentionResults: results });
        return results;
      }
    }
    this.setState({ mentionResults: results });
    return results;
  };

  _close = () => this.props.cancel().then(() => this.props.navigation.goBack(null));
  _leftComponent = () => ({ text: 'Cancel', onPress: this._close, style: styles.cancel });
  _rightComponent = () => (
    <MainButton style={styles.postButton} onPress={this._submit} textStyle={styles.postText}>
      ense it
    </MainButton>
  );
  _toggleUnlisted = () => this.setState(s => ({ unlisted: !s.unlisted }));

  _submit = () => {
    // TODO better ref handling on close // non-eager fallback
    const { publish, cancel, inReplyTo, navigation } = this.props;
    const { text, unlisted } = this.state;
    publish({ title: text || '', unlisted, inReplyTo }).then(cancel);

    navigation.goBack(null);
  };

  _inReplyTo = () => {
    const { inReplyTo } = this.props;
    if (inReplyTo) {
      const handle = get(inReplyTo, 'userhandle');
      return (
        <Text style={styles.inReplyTo} numberOfLines={1}>
          Replying to{handle ? ` @${handle}` : ''}: {inReplyTo.title}
        </Text>
      );
    }
    return null;
  };

  _insertHandle = (handle: string) => {
    const { text } = this.state;
    if (!text) return;
    let pos = -1;
    let match;
    // eslint-disable-next-line no-cond-assign,no-undef
    while ((match = userSearchRe.exec(text))) {
      pos = match.index;
    }
    if (pos > -1) {
      const newText = pos === 0 ? `@${handle} ` : `${text.slice(0, pos - 1)} @${handle} `;
      const i = newText.length;
      this.setState({ text: newText, mentionResults: [] }, () => {
        setTimeout(() => {
          this.input && this.input.setNativeProps({ selection: { start: i, end: i } });
        }, 50);
      });
    }
  };

  _renderSuggest = ({ item }: { item: Mention }) => (
    <TouchableHighlight
      onPress={() => this._insertHandle(item.handle)}
      underlayColor={Colors.gray['0']}
    >
      <View
        style={{
          flexDirection: 'column',
          paddingHorizontal,
          paddingVertical: halfPad,
          borderBottomWidth: 0.5,
          borderBottomColor: Colors.gray['0'],
        }}
      >
        <Text style={{ fontWeight: 'bold', marginBottom: quarterPad }}>{item.name}</Text>
        <Text style={{ color: Colors.gray['3'] }}>{item.handle}</Text>
      </View>
    </TouchableHighlight>
  );

  componentDidMount() {
    const { inReplyTo } = this.props;
    if (inReplyTo) {
      const _users = (inReplyTo.title.match(usersRe) || []).join(' ');
      const users = _users ? `${_users} ` : '';
      const _tags = (inReplyTo.title.match(tagsRe) || []).join(' ');
      const tags = _tags ? `\n\n${_tags}` : '';
      this.setState({ unlisted: inReplyTo.unlisted, text: `${users}${tags}` }, () => {
        const i = users.length;
        setTimeout(() => {
          this.input && this.input.setNativeProps({ selection: { start: i, end: i } });
        }, 50);
      });
    }
  }

  render() {
    const { user } = this.props;
    const { unlisted, mentioning, mentionResults } = this.state;
    return (
      <KeyboardAvoidingView style={styles.root} behavior="height">
        <Header
          leftComponent={this._leftComponent()}
          containerStyle={styles.header}
          centerContainerStyle={{ flex: 0 }}
          rightComponent={this._rightComponent()}
        />
        {this._inReplyTo()}
        <View style={styles.textContainer}>
          <Image
            source={{ uri: get(user, 'profpicURL', emptyProfPicUrl) }}
            style={styles.img}
            resizeMode="cover"
          />
          <TextInput
            ref={r => (this.input = r)}
            style={styles.textInput}
            onChangeText={this._onTextChange}
            value={this.state.text}
            returnKeyType="done"
            placeholder="What's happening?"
            keyboardType={ifiOS('twitter', 'default')}
            placeholderTextColor={Colors.gray['4']}
            multiline
            autoFocus
          />
        </View>
        <View style={{ flex: 1 }} />
        {mentioning && mentionResults.length ? (
          <FlatList
            keyboardShouldPersistTaps="always"
            style={styles.suggestions}
            renderItem={this._renderSuggest}
            keyExtractor={item => item.handle || item.name}
            data={mentionResults}
          />
        ) : null}
        <CheckBox
          title={unlisted ? 'Private' : 'Public'}
          containerStyle={styles.checkbox}
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
  root: { flex: 1, flexDirection: 'column', backgroundColor: 'white' },
  container: { flexDirection: 'column', flex: 1 },
  textContainer: { flexDirection: 'row', flexShrink: 1 },
  textInput: {
    padding,
    marginTop: 18,
    paddingLeft: halfPad,
  },
  postButton: { borderRadius: 18 },
  postText: { fontWeight: 'bold' },
  img: { marginLeft, marginTop, width: imgSize, height: imgSize, borderRadius: imgSize / 2 },
  header: { borderBottomWidth: 0, justifyContent: 'space-between', flexDirection: 'row' },
  checkbox: { backgroundColor: 'transparent', borderWidth: 0 },
  inReplyTo: { color: Colors.gray['3'], fontSize: small, marginTop: padding, paddingHorizontal },
  suggestions: {
    flex: 1,
    minHeight: 120,
    flexShrink: 1,
    borderWidth: 0.5,
    borderColor: Colors.gray['0'],
  },
  cancel: {},
});

const select = createSelector(
  [userSelector, 'run.inReplyTo', 'accounts._cache'],
  (user, inReplyTo, cache) => ({
    user,
    inReplyTo,
    accounts: Object.values(cache)
      // $FlowIgnore
      .map((a: PublicAccount) => ({
        name: a.publicAccountDisplayName,
        handle: a.publicAccountHandle,
      }))
      .filter(a => a.handle),
  })
);
const dispatch = (d: Dispatch): DP => ({
  publish: (info: PublishInfo) => d(publishEnse(info)),
  cancel: () => d(cancelRecording),
});

export default connect<P, *, *, DP, State, Dispatch>(
  select,
  dispatch
)(PostEnseScreen);
