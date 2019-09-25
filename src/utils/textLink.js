import { linkedText } from 'constants/Styles';
import { renderShortUrl } from 'utils/strings';
import { Linking } from 'react-native';
import routes from 'utils/api/routes';
import { enseUrlList, pubProfile } from 'navigation/keys';
import { NavigationScreenProp, NavigationState } from 'react-navigation';

type NP = NavigationScreenProp<NavigationState>;

const _onUrl = url => Linking.openURL(url);

const _onTopic = (nav: NP) => (tag: string) => {
  const params = { title: tag, url: routes.topic(tag.replace(/^#/, '')) };
  typeof nav.navigate === 'function' && nav.navigate(enseUrlList.key, params);
};

const _onHandle = (nav: NP) => (atHandle: string) => {
  const { navigate } = nav;
  if (!atHandle || !navigate) {
    return;
  }
  const userHandle = atHandle.replace(/^@/, '');
  navigate(pubProfile.key, { userHandle });
};

const parser = (nav: NP, extraStyles) => {
  const style = extraStyles ? { ...linkedText, ...extraStyles } : linkedText;
  return [
    { type: 'url', style, onPress: _onUrl, renderText: renderShortUrl },
    { pattern: /#([\w-_]+)/, style, onPress: _onTopic(nav) },
    { pattern: /@([\w-_]+)/, style, onPress: _onHandle(nav) },
  ];
};

export default parser;
