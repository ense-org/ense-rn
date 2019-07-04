// @flow

import { stackNavigator, withTabBarOpts } from 'navigation/helpers';
import { mentionsTab as k } from 'navigation/keys';
import { routes } from 'utils/api';
import MentionsScreen from 'screens/MentionsScreen';

const MentionsStack = stackNavigator(
  {
    [k.myMentions.key]: MentionsScreen,
  },
  {
    initialRouteName: k.myMentions.key,
    initialRouteParams: {
      url: routes.mentionsMe,
      title: 'mentions',
    },
  }
);

const label = 'mentions';
const iconName = 'message-circle';
const iconType = 'Feather';

export default withTabBarOpts({ label, iconName, iconType })(MentionsStack);
