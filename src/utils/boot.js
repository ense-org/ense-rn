import 'intl';
import 'intl/locale-data/jsonp/en';
import 'redux/store'; // store sets a global var `store`
// eslint-disable-next-line import/no-unresolved
import { useScreens } from 'react-native-screens';
import { YellowBox } from 'react-native';
import '@js-joda/timezone';

useScreens();

YellowBox.ignoreWarnings([
  'Warning: componentWillReceiveProps is deprecated',
  'Warning: componentWillUpdate is deprecated',
  'Warning: componentWillMount is deprecated',
  'Remote debugger is in a background',
]);
