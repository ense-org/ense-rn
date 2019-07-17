// @flow
import React from 'react';
import { connect } from 'react-redux';
import { SafeAreaView } from '@react-navigation/native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text } from 'react-native';
import { CheckBox, Header, Input } from 'react-native-elements';
import { doublePad, largePad, margin, marginBottom, marginTop, triplePad } from 'constants/Layout';
import Colors from 'constants/Colors';
import { saveUser as _saveUser, userSelector } from 'redux/ducks/auth';
import User from 'models/User';
import { createSelector } from 'redux-starter-kit';
import type { NLP } from 'utils/types';
import { MainButton, SecondaryButton } from 'components/EnseButton';
import { titleText } from 'constants/Styles';
import { persistor } from 'redux/store';

type SP = {| user: ?User |};
type DP = {||};
type NP = {||};
type P = {|
  ...SP,
  ...NLP<NP>,
  ...DP,
|};
type S = {|
  notificationBits: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean],
|};

// let updatedNotificationPrefValue =
//   !this.state.recommendedContentIsChecked * 256 +
//   !this.state.newLikeNotificationIsChecked * 128 +
//   !this.state.weeklyEmailSubscriptionIsChecked * 64 +
//   !this.state.showListenReceiptsIsChecked * 32 +
//   !this.state.newMentionNotificationIsChecked * 16 +
//   !this.state.newListenNotificationIsChecked * 8 +
//   !this.state.newEnseNotificationIsChecked * 4 +
//   !this.state.newFollowerNotificationIsChecked * 2;

const explanations = [
  'Someone follows you',
  'People you follow post a new ense',
  'Someone listens to your ense first',
  'Someone tags you in an ense',
  'Show listen receipts',
  'Weekly email',
  'Someone reacts to your ense',
  "Today's Ense",
];

const sections = [[3, 2, 1, 0, 6, 7], [5], [4]];
const sectionTitles = ['Push Notifications', 'Email Notifications', 'Listening Preferences'];

class SettingsScreen extends React.Component<P, S> {
  state = { notificationBits: [true, true, true, true, true, true, true, true] };

  _submit = () => {
    this.props.navigation.goBack(null);
  };
  _rightComponent = () => (
    <MainButton style={styles.submitButton} onPress={this._submit} textStyle={styles.submitText}>
      Done
    </MainButton>
  );

  _signOut = () => {
    persistor.purge();
  };

  _toggleVal = (index: number) => () => {
    this.setState(s => ({
      notificationBits: s.notificationBits.map((b, i) => (i === index ? !b : b)),
    }));
  };

  render() {
    const { user } = this.props;
    const { notificationBits } = this.state;
    if (!user) {
      return null;
    }
    return (
      <KeyboardAvoidingView style={styles.root} behavior="height">
        <Header centerComponent={{ text: 'Settings' }} rightComponent={this._rightComponent()} />
        <SafeAreaView style={styles.sav}>
          <ScrollView style={styles.container} contentContainerStyle={styles.scrollView}>
            {sections.map((indicies: number[], i: number) => (
              <>
                <Text style={styles.sectionHead} key={sectionTitles[i]}>
                  {sectionTitles[i]}
                </Text>
                {indicies.map((index: number) => (
                  <CheckBox
                    key={`${sectionTitles[i]}-${index}`}
                    title={explanations[index]}
                    checked={notificationBits[index]}
                    checkedColor={Colors.ense.pink}
                    containerStyle={styles.checkContainer}
                    onPress={this._toggleVal(index)}
                  />
                ))}
              </>
            ))}
            <SecondaryButton style={styles.signOut} onPress={this._signOut}>
              Sign Out
            </SecondaryButton>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sav: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1 },
  scrollView: { alignItems: 'stretch' },
  checkContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    margin,
    paddingHorizontal: 7,
    paddingVertical: 0,
  },
  signOut: { marginTop: triplePad },
  sectionHead: { ...titleText, margin, color: Colors.gray['3'] },
  submitButton: { borderRadius: 18 },
  submitText: { fontWeight: 'bold' },
});

const selector = createSelector(
  [userSelector],
  user => ({ user })
);
const dispatch = d => ({ saveUser: u => d(_saveUser(u)) });
export default connect<P, *, *, *, *, *>(
  selector,
  dispatch
)(connectActionSheet(SettingsScreen));
