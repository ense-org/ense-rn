import { AppRegistry } from 'react-native';
import codePush from 'react-native-code-push';
import App from './App';

const WithCodePush = codePush(App);

AppRegistry.registerComponent('ense', () => WithCodePush);
