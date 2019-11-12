import 'intl';
import 'intl/locale-data/jsonp/en';
import 'redux/store'; // store sets a global var `store`
// eslint-disable-next-line import/no-unresolved
import { useScreens } from 'react-native-screens';
import { YellowBox } from 'react-native';
import git from './git';
import '@js-joda/timezone';

useScreens();

import {
  Client as BSClient,
  Configuration as BSCfg,
} from 'bugsnag-react-native';

const codeVersion = `${git.sha}.${Platform.OS}`;
const cfg = new BSCfg('6d50669a24c902d712d35af166dee4e0');
cfg.codeBundleId = codeVersion;

YellowBox.ignoreWarnings([
  'Warning: componentWillReceiveProps is deprecated',
  'Warning: componentWillUpdate is deprecated',
  'Warning: componentWillMount is deprecated',
  'Remote debugger is in a background',
]);
