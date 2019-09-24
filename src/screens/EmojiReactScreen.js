// @flow

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Header } from 'react-native-elements';
import EmojiSelector from 'components/vendor/EmojiPicker';
import { $post } from 'utils/api';
import routes from 'utils/api/routes';
import Ense from 'models/Ense';
import type { NLP } from 'utils/types';

type P = {| ...NLP<{ ense: Ense }> |};

export default class EmojiReactScreen extends React.Component<P> {
  _close = () => this.props.navigation.goBack(null);
  _leftComponent = () => ({ text: 'Cancel', onPress: this._close, style: styles.cancel });
  _react = async (emotion: string) => {
    const { navigation } = this.props;
    const ense = navigation.getParam('ense');
    await $post(routes.reactions(ense.handle, ense.key), { emotion });
    this._close();
  };

  render() {
    return (
      <View style={styles.root}>
        <Header leftComponent={this._leftComponent()} />
        <SafeAreaView style={styles.sav}>
          <EmojiSelector onEmojiSelected={this._react} />
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'column', backgroundColor: 'white' },
  sav: { flex: 1 },
  cancel: {},
});
