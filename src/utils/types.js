// @flow
import { type NavigationState, type NavigationScreenProp } from 'react-navigation';

export type IconType =
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Feather'
  | 'FontAwesome'
  | 'FontAwesome'
  | 'Foundation'
  | 'Ionicons'
  | 'MaterialIcons'
  | 'MaterialCommunityIcons'
  | 'Octicons'
  | 'Zocial'
  | 'SimpleLineIcons';

/**
 * Has a lastUpdated key, referring to an epoch second instant
 */
export type HasLastUpdated = {| _lastUpdated: ?number |};

export type NP = {| navigation: NavigationScreenProp<NavigationState> |};
