// @flow
import React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { SafeAreaView } from '@react-navigation/native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
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
import type { NLP } from 'utils/types';
import type { UserJSON } from 'models/User';
import * as Permissions from 'expo-permissions';
import { isIOS } from 'utils/device';
import * as ImagePicker from 'expo-image-picker';
import changeProfPic from 'utils/api/changeProfPic';

type SP = {| user: ?User |};
type DP = {| saveUser: UserJSON => void |};
type NP = {| first?: boolean |};
type P = {|
  ...SP,
  ...NLP<NP>,
  ...DP,
  showActionSheetWithOptions: (Object, (number) => void) => void,
|};
type S = {|
  name: string,
  username: string,
  email: string,
  bio: string,
  submitting: boolean,
  imageUploading: boolean,
|};

const editButton = { name: 'mode-edit', type: 'material', color: 'white' };

class EditProfileScreen extends React.Component<P, S> {
  state = { name: '', username: '', email: '', bio: '', submitting: false, imageUploading: false };

  _submit = async () => {
    this.setState({ submitting: true });
    const { user, navigation, saveUser } = this.props;
    const { name, bio, email, username } = this.state;
    const emailChanged = email !== get(user, 'email');
    const handleChanged = username !== get(user, 'handle');
    const infoChanged = name !== get(user, 'displayName') || bio !== get(user, 'bio');
    const noop = Promise.resolve(null);
    const successUrl = urlFor(`/${username}`);

    // eslint-disable-next-line no-unused-vars
    const [e, h, u] = await Promise.all([
      emailChanged ? $post(routes.emailVerify, { email, successUrl }) : noop,
      handleChanged ? $post(routes.userHandle, { newHandle: username }) : noop,
      infoChanged ? $post(routes.accountInfo, { displayName: name, bio }) : noop,
    ]);
    u && u.contents && saveUser(u.contents);
    this.setState({ submitting: false });
    navigation.goBack(null);
  };

  _cameraRollPermissions = async () => {
    if (isIOS) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Please grant camera roll permissions for Ense in iOS Settings');
      }
    }
  };

  _cameraPermissions = async () => {
    if (isIOS) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      if (status !== 'granted') {
        alert('Please grant camera permissions for Ense in iOS Settings');
      }
    }
  };

  _fromCameraRoll = async () => {
    await this._cameraRollPermissions();
    const img = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (img.uri) {
      const user = await changeProfPic(img.uri, img.type || 'image/jpeg');
      user && user.contents && this.props.saveUser(user.contents);
    }
  };

  _takePhoto = async () => {
    await this._cameraRollPermissions();
    await this._cameraPermissions();
    const img = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (img.uri) {
      const user = await changeProfPic(img.uri, img.type || 'image/jpeg');
      user && user.contents && this.props.saveUser(user.contents);
    }
  };

  _loadingComponent = <ActivityIndicator />;
  _submittable = () => {
    const { name, email, username } = this.state;
    return name && email && username;
  };

  _rightComponent = () => (
    <MainButton
      style={styles.submitButton}
      onPress={this._submit}
      textStyle={styles.submitText}
      disabled={!this._submittable()}
    >
      Done
    </MainButton>
  );
  _centerTitle = () => ({
    text: `${this.props.navigation.getParam('first') ? 'Create' : 'Edit'} Profile`,
  });

  _changePic = () => {
    this.props.showActionSheetWithOptions(
      {
        options: ['From Camera Roll', 'Take Photo', 'Cancel'],
        cancelButtonIndex: 2,
      },
      async (idx: number) => {
        if (idx === 0) {
          this.setState({ imageUploading: true });
          await this._fromCameraRoll();
          this.setState({ imageUploading: false });
        } else if (idx === 1) {
          this.setState({ imageUploading: true });
          await this._takePhoto();
          this.setState({ imageUploading: false });
        }
      }
    );
  };

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
    const { name, email, bio, username, submitting, imageUploading } = this.state;
    const busy = imageUploading || submitting;
    return (
      <KeyboardAvoidingView style={styles.root} behavior="height">
        <Header
          rightComponent={busy ? this._loadingComponent : this._rightComponent()}
          centerComponent={this._centerTitle()}
        />
        <SafeAreaView style={styles.sav}>
          <ScrollView style={styles.container} contentContainerStyle={styles.scrollView}>
            <Avatar
              size={128}
              containerStyle={styles.img}
              source={{ uri: user.profpicURL || emptyProfPicUrl }}
              onPress={this._changePic}
              activeOpacity={0.8}
              editButton={editButton}
              showEditButton
              rounded
              ImageComponent={imageUploading ? ActivityIndicator : undefined}
            />
            <Input
              placeholder="Name (required)"
              containerStyle={styles.textInput}
              label="Full Name"
              textContentType="name"
              autoCompleteType="name"
              value={name}
              onChangeText={this._onChangeName}
            />
            <Input
              placeholder="User Handle (required)"
              containerStyle={styles.textInput}
              textContentType="username"
              label="Handle"
              autoCapitalize="none"
              autoCompleteType="username"
              value={username}
              onChangeText={this._onChangeUsername}
            />
            <Input
              placeholder="Email (required)"
              containerStyle={styles.textInput}
              textContentType="emailAddress"
              autoCompleteType="email"
              keyboardType="email-address"
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
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
const dispatch = d => ({ saveUser: u => d(_saveUser(u)) });
export default connect<P, *, *, *, *, *>(
  selector,
  dispatch
)(connectActionSheet(EditProfileScreen));
