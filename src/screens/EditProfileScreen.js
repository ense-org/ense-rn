// @flow
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { SafeAreaView } from '@react-navigation/native';
import { ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Avatar, Header, Input } from 'react-native-elements';
import { halfPad, largePad, marginBottom } from 'constants/Layout';
import { MainButton } from 'components/EnseButton';
import Colors from 'constants/Colors';
import { saveUser as _saveUser, userSelector } from 'redux/ducks/auth';
import User from 'models/User';
import { emptyProfPicUrl } from 'constants/Values';
import { createSelector } from 'redux-starter-kit';
import { $post, urlFor } from 'utils/api';
import routes from 'utils/api/routes';
import type { NP } from 'utils/types';
import type { UserJSON } from 'models/User';

type SP = {| user: ?User |};
type DP = {| saveUser: UserJSON => void |};
type P = {| ...SP, ...NP, ...DP |};
type S = {| name: string, username: string, email: string, bio: string, submitting: boolean |};
const centerTitle = { text: 'Edit Profile' };
const editButton = {
  name: 'mode-edit',
  type: 'material',
  color: 'white',
};
class EditProfileScreen extends React.Component<P, S> {
  static navigationOptions = { title: 'Edit Profile' };
  state = { name: '', username: '', email: '', bio: '', submitting: false };

  _submit = async () => {
    const { user, navigation, saveUser } = this.props;
    const { name, bio, email, username } = this.state;
    this.setState({ submitting: true });
    const promises = [];
    if (email !== get(user, 'email')) {
      promises.push($post(routes.emailVerify, { email, successUrl: urlFor(`/${username}`) }));
    } else {
      promises.push(Promise.resolve(null));
    }
    if (username !== get(user, 'handle')) {
      promises.push($post(routes.userHandle, { newHandle: username }));
    } else {
      promises.push(Promise.resolve(null));
    }
    if (name !== get(user, 'displayName') || bio !== get(user, 'bio')) {
      promises.push($post(routes.accountInfo, { displayName: name, bio }));
    } else {
      promises.push(Promise.resolve(null));
    }
    const [e, h, u] = await Promise.all(promises);
    u && u.contents && saveUser(u.contents);
    this.setState({ submitting: false });
    navigation.goBack(null);
  };
  _loadingComponent = <ActivityIndicator />;
  _rightComponent = (
    <MainButton style={styles.submitButton} onPress={this._submit} textStyle={styles.submitText}>
      Done
    </MainButton>
  );

  _onChangeName = (name: string) => this.setState({ name });
  _onChangeEmail = (email: string) => this.setState({ email });
  _onChangeUsername = (username: string) => this.setState({ username });
  _onChangeBio = (bio: string) => this.setState({ bio });

  componentDidMount() {
    const { user } = this.props;
    if (user) {
      this.setState({
        name: user.displayName || '',
        username: user.handle || '',
        bio: user.bio || '',
        email: user.email || '',
      });
    }
  }

  render() {
    const { user } = this.props;
    if (!user) {
      return null;
    }
    const { name, email, bio, username, submitting } = this.state;
    return (
      <>
        <Header
          title="Edit Profile"
          rightComponent={submitting ? this._loadingComponent : this._rightComponent}
          centerComponent={centerTitle}
        />
        <SafeAreaView style={styles.sav}>
          <ScrollView style={styles.container} contentContainerStyle={styles.scrollView}>
            <Avatar
              size={128}
              containerStyle={styles.img}
              source={{ uri: user.profpicURL || emptyProfPicUrl }}
              onPress={() => console.log('Works!')}
              activeOpacity={0.8}
              editButton={editButton}
              showEditButton
              rounded
            />
            <Input
              placeholder="Name (required)"
              containerStyle={styles.textInput}
              label="Full Name"
              value={name}
              onChangeText={this._onChangeName}
            />
            <Input
              placeholder="User Handle (required)"
              containerStyle={styles.textInput}
              label="Handle"
              value={username}
              onChangeText={this._onChangeUsername}
            />
            <Input
              placeholder="Email (required)"
              containerStyle={styles.textInput}
              label="Email"
              value={email}
              onChangeText={this._onChangeEmail}
            />
            <Input
              placeholder="Bio"
              containerStyle={styles.textInput}
              label="Bio"
              value={bio}
              onChangeText={this._onChangeBio}
            />
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  sav: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, paddingHorizontal: halfPad },
  scrollView: { alignItems: 'center' },
  textInput: { marginBottom },
  img: { backgroundColor: Colors.gray['3'], marginVertical: largePad },
  submitButton: { borderRadius: 18 },
  submitText: { fontWeight: 'bold' },
});

const selector = createSelector(
  [userSelector],
  user => ({ user })
);
const dispatch = d => ({ saveUser: u => _saveUser(u) });
export default connect<P, *, *, *, *, *>(
  selector,
  dispatch
)(EditProfileScreen);
