// @flow
import * as React from 'react';
import layout, { halfPad, padding, paddingHorizontal, regular } from 'constants/Layout';
import { Overlay } from 'react-native-elements';
import { StyleSheet, Text, View } from 'react-native';
import AccountList from 'components/AccountList';
import Colors from 'constants/Colors';
import PublicAccount from 'models/PublicAccount';

type P = {| visible: boolean, accounts: PublicAccount[], close?: () => void |};

const height = Math.min(layout.window.width, 400);

export const ListensOverlay = (p: P) => (
  <Overlay
    isVisible={p.visible}
    overlayStyle={styles.overlayStyle}
    animationType="fade"
    height={height}
    width={layout.window.width - 20}
    onBackdropPress={p.close}
  >
    <View style={styles.container}>
      <AccountList
        accounts={p.accounts}
        listHeader={<Text style={styles.listTitle}>🎧 {p.accounts.length || ''} Listens</Text>}
        onSelect={p.close}
      />
    </View>
  </Overlay>
);

export const ReactionsOverlay = (p: P) => (
  <Overlay
    isVisible={p.visible}
    overlayStyle={styles.overlayStyle}
    animationType="fade"
    height={height}
    width={layout.window.width - 20}
    onBackdropPress={p.close}
  >
    <View style={styles.container}>
      <AccountList
        accounts={p.accounts}
        listHeader={<Text style={styles.listTitle}>Reactions</Text>}
        onSelect={p.close}
      />
    </View>
  </Overlay>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'column', flex: 1 },
  overlayStyle: { paddingHorizontal: 0, borderRadius: 8 },
  listTitle: {
    paddingHorizontal,
    paddingTop: halfPad,
    paddingBottom: padding,
    fontSize: regular,
    fontWeight: 'bold',
  },
});
