// @flow
import React from 'react';
import { sum } from 'lodash';
import { connect } from 'react-redux';
import { SafeAreaView } from '@react-navigation/native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckBox, Header } from 'react-native-elements';
import { margin, triplePad } from 'constants/Layout';
import Colors from 'constants/Colors';
import { saveUser as _saveUser, userSelector } from 'redux/ducks/auth';
import User from 'models/User';
import { createSelector } from 'redux-starter-kit';
import type { NLP } from 'utils/types';
import { MainButton, SecondaryButton } from 'components/EnseButton';
import { titleText } from 'constants/Styles';
import { persistor } from 'redux/store';
import routes from 'utils/api/routes';
import { $post } from 'utils/api';
import type { UserJSON } from 'models/types';
import { dangerReset } from 'redux/ducks/run';

type SP = {| user: ?User |};
type DP = {| saveUser: UserJSON => void, resetRunState: () => void |};
type NP = {||};
type P = {| ...SP, ...NLP<NP>, ...DP |};
type NotifBits = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
type S = {| notificationBits: NotifBits |};

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
const sectionTitles = ['Push Notifications', 'Email Notifications', 'Listening Preferences'];
const sections = [[3, 2, 1, 0, 6, 7], [5], [4]];

class SettingsScreen extends React.Component<P, S> {
  state = { notificationBits: [true, true, true, true, true, true, true, true] };

  _submit = async () => {
    /* eslint-disable-next-line no-mixed-operators */
    const notifications = sum(this.state.notificationBits.map((b, i) => Number(!b) * 2 ** (i + 1)));
    const u = await $post(routes.accountInfo, { notifications });
    u && u.contents && this.props.saveUser(u.contents);
    this.props.navigation.goBack(null);
  };

  _rightComponent = () => (
    <MainButton style={styles.submitButton} onPress={this._submit} textStyle={styles.submitText}>
      Done
    </MainButton>
  );

  _signOut = async () => {
    await persistor.purge();
    this.props.resetRunState();
  };

  _toggleVal = (index: number) => () => {
    // $FlowIssue - should recognize it's the same size
    this.setState(({ notificationBits }) => ({
      notificationBits: notificationBits.map((b, i) => (i === index ? !b : b)),
    }));
  };

  componentDidMount() {
    const { user } = this.props;
    if (!user || typeof user.notifications !== 'number') return;
    this.setState({ notificationBits: this._toBits(user.notifications) });
  }

  /* eslint-disable no-bitwise */
  _toBits = (n: number): NotifBits =>
    // $FlowIgnore
    this.state.notificationBits.map((_, i) => i + 1).map(p => !((n & (1 << p)) >> p));
  /* eslint-disable no-bitwise */

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
              <View style={styles.section} key={sectionTitles[i]}>
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
              </View>
            ))}
            <SecondaryButton style={styles.signOut} onPress={this._signOut} key="sign-out">
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
  section: { flexDirection: 'column' },
  checkContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    margin,
    paddingHorizontal: 7,
    paddingVertical: 0,
  },
  signOut: { marginVertical: triplePad },
  sectionHead: { ...titleText, margin, color: Colors.gray['3'] },
  submitButton: { borderRadius: 18 },
  submitText: { fontWeight: 'bold' },
});

const selector = createSelector(
  [userSelector],
  user => ({ user })
);
const dispatch = d => ({ saveUser: u => d(_saveUser(u)), resetRunState: () => d(dangerReset) });
export default connect<P, *, *, *, *, *>(
  selector,
  dispatch
)(connectActionSheet(SettingsScreen));
