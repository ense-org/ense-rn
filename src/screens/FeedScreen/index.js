// @flow

import React from 'react';
import { get, omitBy, zipObject } from 'lodash';
import firebase from 'react-native-firebase';
import type { NotificationOpen } from 'react-native-firebase';
import { createSelector } from 'redux-starter-kit';
import Toast from 'react-native-root-toast';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
  Linking,
  AsyncStorage,
  Platform,
} from 'react-native';
import { ScrollableTabView } from 'components/vendor/ScrollableTabView';
import { connect } from 'react-redux';
import { $get, routes, $post } from 'utils/api';
import type { EnseGroups, HomeInfo, SelectedFeedLists } from 'redux/ducks/feed';
import {
  feedLists,
  home as homeR,
  replaceEnses,
  saveFeedsList,
  updateEnses,
} from 'redux/ducks/feed';
import Feed from 'models/Feed';
import Colors from 'constants/Colors';
import type { FeedJSON, FeedPath, FeedResponse } from 'utils/api/types';
import EmptyListView from 'components/EmptyListView';
import type { EnseId } from 'models/types';
import { currentlyPlaying, playQueue, loadAndPlay as _loadAndPlay } from 'redux/ducks/run';
import User from 'models/User';
import { padding } from 'constants/Layout';
import ScrollableTabBar from 'components/vendor/ScrollableTabView/ScrollableTabBar';
import FeedItem from 'components/FeedItem';
import type { SectionBase } from 'react-native/Libraries/Lists/SectionList';
import urlParse from 'url-parse';
import Ense from 'models/Ense';
import { enseUrlList, pubProfile, root } from 'navigation/keys';
import { deeplink } from 'utils/api/routes';
import { getOrFetch } from 'redux/ducks/accounts';
import PublicAccount from 'models/PublicAccount';
import type { EnseUrlScreenParams as EUSP } from 'screens/EnseUrlScreen';

type SP = {| home: HomeInfo, ...SelectedFeedLists, currentlyPlaying: ?Ense, user: ?User |};
type DP = {|
  saveFeeds: (FeedJSON[]) => void,
  replaceEnses: EnseGroups => void,
  updateEnses: EnseGroups => void,
  playEnses: (Ense[]) => Promise<any>,
  loadAndPlay: (key: string, handle: string) => Promise<?Ense>,
  getProfile: string => Promise<?PublicAccount>,
|};
type P = {| ...DP, ...SP |};

type S = { refreshing: { [string]: boolean } };
class FeedScreen extends React.Component<P, S> {
  static navigationOptions = { title: 'ense' };
  state = { refreshing: {} };

  showPlayer = (ense: Ense) => this.props.navigation.navigate(root.fullPlayer.key, { ense });

  _goToProfile = (profile: PublicAccount) => {
    const userHandle = profile.publicAccountHandle;
    const userId = profile.publicAccountId;
    if (!(userHandle || userId)) {
      return;
    }
    this.props.navigation.push(pubProfile.key, { userHandle, userId });
  };

  _pushEnseScreen = (params: EUSP) => {
    const { navigation } = this.props;
    // $FlowIgnore - we can do better nav typing eventually
    typeof navigation.push === 'function' && navigation.push(enseUrlList.key, params);
  };

  _handleOpenURL = event => {
    const { getProfile, loadAndPlay } = this.props;
    const parsed = urlParse(event.url);
    if (parsed.pathname.match(deeplink.ense)) {
      const [_, key, handle] = parsed.pathname.match(deeplink.ense);
      loadAndPlay(key, handle).then(e => e && this.showPlayer(e));
    } else if (parsed.pathname.match(deeplink.username)) {
      const [_, handle] = parsed.pathname.match(deeplink.username);
      getProfile(handle).then(p => p && this._goToProfile(p));
    } else if (parsed.pathname.match(deeplink.playlist)) {
      const [_, key, handle] = parsed.pathname.match(deeplink.playlist);
      this._pushEnseScreen({
        title: 'playlist',
        url: routes.playlistEnses(key, handle),
        autoPlay: true,
        getTitle: () => $get(routes.playlistInfo(key, handle)).then(r => r.title),
      });
    }
  };

  getToken = async () => {
    firebase.messaging().onTokenRefresh(async fcmToken => {
      await AsyncStorage.setItem('fcmToken', fcmToken);
      await $post(routes.pushToken, { push_token: fcmToken, push_type: Platform.OS });
    });
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
        await $post(routes.pushToken, { push_token: fcmToken, push_type: Platform.OS });
      }
    }
  };

  checkPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      await this.getToken();
    } else {
      try {
        await firebase.messaging().requestPermission();
      } catch (error) {
        console.log('permission rejected');
      }
    }
  };

  async componentDidMount(): void {
    this.refreshAll();
    Linking.addEventListener('url', this._handleOpenURL);
    Linking.getInitialURL()
      .then(url => url && this._handleOpenURL({ url }))
      .catch(err => console.error('app link error', err));
    this.registerNotifications();
    await this.checkPermission();
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL);
    this.unregisterNotifications();
  }

  componentDidUpdate(prev: P) {
    const id = get(this.props.user, 'id');
    if (id && get(prev.user, 'id') !== id) {
      this.refreshAll();
    }
  }

  registerNotifications = () => {
    const { getProfile, loadAndPlay } = this.props;
    this.unregisterNotifications = firebase
      .notifications()
      .onNotificationOpened((open: NotificationOpen) => {
        const { notification } = open;
        // try {
        //   this.setState({
        //     foo:
        //       typeof open === 'object'
        //         ? JSON.stringify({ ...notification.data, string: true, tap: notification.tap })
        //         : notification,
        //   });
        // } catch (e) {
        //   this.setState({ foo: String(e) + 'from catch' });
        // }
        // if (notification.tap) {
        const isString = typeof notification.data === 'string';
        if (isString) {
          Toast.show(notification.data, { position: Toast.positions.CENTER });
        } else {
          Toast.show('not string', { position: Toast.positions.CENTER });
        }
        const data = isString ? JSON.parse(notification.data) : notification.data;
        Toast.show(notification.eventType, { position: Toast.positions.BOTTOM });
        if (
          notification.eventType.startsWith('ense:') ||
          notification.eventType.startsWith('plays:')
        ) {
          try {
            Toast.show('show player', { position: Toast.positions.TOP });
            this.showPlayer(Ense.parse(data));
          } catch (e) {
            Toast.show('catch' + String(e), { position: Toast.positions.TOP });
            if (data.key && data.handle) {
              loadAndPlay(data.key, data.handle).then(e => e && this.showPlayer(e));
            }
          }
        } else if (notification.eventType.startsWith('users:')) {
          try {
            this.showPlayer(Ense.parse(data));
          } catch {
            if (data.publicAccountHandle) {
              getProfile(data.publicAccountHandle).then(p => p && this._goToProfile(p));
            }
          }
        }
        // } else {
        //   Toast.show('no tap');
        // }
      });
  };

  refreshAll = () =>
    this.fetchFeeds()
      .then(this.fetchEnsesBatch)
      .then(this.saveEnsesBatch);

  fetchAndSave = (feed: Feed) => {
    this._setRefreshing(feed, true);
    this.fetchEnsesBatch([feed])
      .then(this.props.updateEnses)
      .finally(() => this._setRefreshing(feed, false));
  };

  fetchFeeds = async (): Promise<Feed[]> => {
    const feeds: FeedJSON[] = await $get(routes.explore);
    this.props.saveFeeds(feeds);
    return feeds.map(Feed.parse);
  };

  _setRefreshing = (feed: Feed, refreshing: boolean) =>
    this.setState(s => ({ refreshing: { ...s.refreshing, [feed.title]: refreshing } }));

  fetchEnses = async (forFeed: Feed) => forFeed.fetch().catch(e => e);

  fetchEnsesBatch = async (forFeeds: Feed[]) =>
    Promise.all(forFeeds.map(this.fetchEnses)).then(responses =>
      zipObject(forFeeds.map(f => f.url), responses)
    );

  saveEnsesBatch = async (feeds: { [string]: FeedResponse | Error }) => {
    this.props.replaceEnses(omitBy(feeds, v => v instanceof Error));
  };

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  render() {
    const {
      home: { sections },
    } = this.props;
    if (!sections.length) {
      return <EmptyListView />;
    }
    return (
      <ScrollableTabView
        style={{ backgroundColor: Colors.gray['0'] }}
        tabBarUnderlineStyle={styles.tabUnderline}
        tabBarActiveTextColor={Colors.ense.pink}
        tabBarInactiveTextColor={Colors.gray['3']}
        tabBarBackgroundColor="white"
        showsHorizontalScrollIndicator={false}
        renderTabBar={this._scrollableTabs}
      >
        {sections.map(section => (
          <SectionList
            refreshControl={
              <RefreshControl
                refreshing={get(this.state, ['refreshing', section.feed.title], false)}
                onRefresh={() => this.fetchAndSave(section.feed)}
              />
            }
            key={section.feed.title}
            style={styles.container}
            tabLabel={section.feed.title}
            renderItem={this._renderItem}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={this._renderSectionHeader}
            keyExtractor={item => item}
            ListEmptyComponent={EmptyListView}
            sections={section.data.length ? [section] : []}
          />
        ))}
      </ScrollableTabView>
    );
  }

  _renderSectionHeader = ({ section }: SectionBase<EnseId>) => {
    const subtitle = get(section, 'feed.subtitle');
    if (subtitle) {
      return (
        <View style={styles.sectionHeadWrap}>
          <Text style={styles.sectionHead}>{subtitle}</Text>
        </View>
      );
    }
    return null;
  };

  _renderItem = ({ item, section, index }: SectionBase<EnseId>) => (
    <FeedItem
      ense={this.props.home.enses[item]}
      isPlaying={item === get(this.props.currentlyPlaying, 'key')}
      onPress={() =>
        this.props.playEnses(section.data.slice(index).map(k => this.props.home.enses[k]))
      }
    />
  );

  _scrollableTabs = () => <ScrollableTabBar />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray['0'] },
  tabUnderline: { backgroundColor: Colors.ense.pink, borderRadius: 2, height: 3 },
  sectionHeadWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.gray['0'],
  },
  sectionHead: { color: Colors.ense.midnight, padding, flex: 1 },
});

const selector = createSelector(
  [homeR, feedLists, currentlyPlaying, 'auth.user'],
  (h: HomeInfo, fl: { [FeedPath]: Feed }, cp: boolean, user: ?User) => ({
    home: h,
    feedLists: fl,
    currentlyPlaying: cp,
    user,
  })
);
const disp = d => ({
  saveFeeds: feeds => d(saveFeedsList(feeds)),
  replaceEnses: enses => d(replaceEnses(enses)),
  updateEnses: enses => d(updateEnses(enses)),
  playEnses: (enses: Ense[]) => d(playQueue(enses)),
  loadAndPlay: (key: string, handle: string) => d(_loadAndPlay(key, handle)),
  getProfile: handle => d(getOrFetch(handle)),
});
export default connect<P, *, *, *, *, *>(
  selector,
  disp
)(FeedScreen);
