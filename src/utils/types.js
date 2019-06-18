// @flow
import type { NavigationState, NavigationScreenProp, NavigationLeafRoute } from 'react-navigation';

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

/**
 * General Navigation prop, use this on non-leaf navigators, or if you just don't have props.
 */
export type NP = {| navigation: NavigationScreenProp<NavigationState> |};

/**
 * Yeah, this is weird, but use this one for the nav prop of leaf navigation screens,
 * i.e. ones that you wanna use props on.
 */
export type NLP<P> = {|
  navigation: NavigationScreenProp<{|
    ...$Exact<NavigationState>,
    ...NavigationLeafRoute,
    params: P,
  |}>,
|};
