// @flow

import React from 'react';
import { get, omitBy, zipObject } from 'lodash';
import firebase from 'react-native-firebase';
import type { NotificationOpen } from 'react-native-firebase';
import { createSelector } from 'redux-starter-kit';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
  Linking,
  AsyncStorage,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ScrollableTabView } from 'components/vendor/ScrollableTabView';
import { connect } from 'react-redux';
import { $get, routes, $post } from 'utils/api';
import type { EnseGroups, HomeInfo, HomeSection, SelectedFeedLists } from 'redux/ducks/feed';
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
import {
  currentlyPlaying,
  playQueue,
  loadAndPlay as _loadAndPlay,
  setAudioMode,
} from 'redux/ducks/run';
import User from 'models/User';
import { marginVertical, padding } from 'constants/Layout';
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
import enseicons from 'utils/enseicons';
import ParsedText from 'components/ParsedText';
import parser from 'utils/textLink';

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

type S = {
  refreshing: { [string]: boolean },
  hasMore: { [string]: boolean },
  backLoading: { [string]: boolean },
};
class FeedScreen extends React.Component<P, S> {
  static navigationOptions = {
    title: enseicons.logo,
    headerTitleStyle: {
      fontFamily: 'enseicons2',
      fontSize: 40,
      color: Colors.ense.pink,
    },
  };
  state = { refreshing: {}, hasMore: {}, backLoading: {} };

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
    } else if (parsed.pathname.match(deeplink.story)) {
      const [_, user, title] = parsed.pathname.match(deeplink.story);
      this._pushEnseScreen({
        title,
        url: routes.channelNamed(user, title),
        autoPlay: true,
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

  componentDidMount(): void {
    this.refreshAll();
    Linking.addEventListener('url', this._handleOpenURL);
    Linking.getInitialURL()
      .then(url => url && this._handleOpenURL({ url }))
      .catch(err => console.error('app link error', err));
    this.registerNotifications();
    firebase
      .notifications()
      .getInitialNotification()
      .then(this._onNotification);
    this.checkPermission();
    this.props.setAudioMode('record');
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
    this.unregisterNotifications = firebase
      .notifications()
      .onNotificationOpened(this._onNotification);
  };

  _onNotification = async (open: NotificationOpen) => {
    if (!open) {
      return;
    }
    const { getProfile, loadAndPlay, playEnses } = this.props;
    const notification = open.notification.data;
    const isString = typeof notification.data === 'string';
    const data = isString ? JSON.parse(notification.data) : notification.data;
    if (notification.eventType.startsWith('ense:') || notification.eventType.startsWith('plays:')) {
      try {
        const ense = Ense.parse(data);
        await playEnses([ense]);
        this.showPlayer(ense);
      } catch {
        if (data.key && data.handle) {
          const e = await loadAndPlay(data.key, data.handle);
          e && this.showPlayer(e);
        }
      }
    } else if (notification.eventType.startsWith('users:')) {
      try {
        this.showPlayer(Ense.parse(data));
      } catch {
        if (data.publicAccountHandle) {
          const p = await getProfile(data.publicAccountHandle);
          p && this._goToProfile(p);
        }
      }
    }
  };

  refreshAll = () =>
    this.fetchFeeds()
      .then(this.fetchEnsesBatch)
      .then(this.saveEnsesBatch);

  fetchAndSave = (feed: Feed, p?: Object) => {
    this._setRefreshing(feed, true);
    this.fetchEnsesBatch([feed], p)
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

  _setHasMore = (r: FeedResponse, feed: Feed) => {
    this.setState(s => ({
      hasMore: { ...s.hasMore, [feed.title]: get(r, 'enses.length', 0) === 30 },
      backLoading: { ...s.backLoading, [feed.title]: false },
    }));
    return r;
  };

  fetchEnses = async (forFeed: Feed, p?: Object) => {
    this.setState(s => ({
      backLoading: { ...s.backLoading, [forFeed.title]: true },
    }));
    return forFeed
      .fetch(p)
      .then((r: FeedResponse) => this._setHasMore(r, forFeed))
      .catch(e => e);
  };

  fetchEnsesBatch = async (forFeeds: Feed[], p?: Object) =>
    Promise.all(forFeeds.map(feed => this.fetchEnses(feed, p))).then(r => {
      const feeds = p
        ? r.map((resp, i) => {
            const f = forFeeds[i];
            const section = get(this.props, 'home.sections', []).find(
              s => s.feed.title === f.title
            );
            const prev = section ? section.data : [];
            return { ...resp, prev };
          })
        : r;
      return zipObject(forFeeds.map(f => f.url), feeds);
    });

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
            keyboardShouldPersistTaps="handled"
            key={section.feed.title}
            style={styles.container}
            tabLabel={section.feed.title}
            renderItem={this._renderItem}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={this._renderSectionHeader}
            keyExtractor={item => item}
            ListEmptyComponent={EmptyListView}
            sections={section.data.length ? [section] : []}
            onEndReached={() => this._loadMore(section)}
            onEndReachedThreshold={0.7}
            ListFooterComponent={
              get(this.state, ['backLoading', section.feed.title]) ? (
                <ActivityIndicator style={styles.loadingMore} />
              ) : null
            }
          />
        ))}
      </ScrollableTabView>
    );
  }

  _loadMore = (section: HomeSection) => {
    const skip = get(section, 'data.length');
    const hasMore = get(this.state, ['hasMore', section.feed.title]);
    const backLoading = get(this.state, ['backLoading', section.feed.title]);
    if (skip && hasMore && !backLoading) {
      const p = { fromID: section.data[skip - 1], skip, offset: skip };
      this.fetchAndSave(section.feed, p);
    }
  };

  _renderSectionHeader = ({ section }: SectionBase<EnseId>) => {
    const subtitle = get(section, 'feed.subtitle');
    const { navigation } = this.props;
    if (subtitle) {
      return (
        <View style={styles.sectionHeadWrap}>
          <ParsedText style={styles.sectionHead} parse={parser(navigation)}>
            {subtitle}
          </ParsedText>
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
  sectionHead: { color: Colors.gray['3'], padding, flex: 1, textAlign: 'center' },
  loadingMore: { marginVertical },
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
  setAudioMode: m => d(setAudioMode(m)),
});
export default connect<P, *, *, *, *, *>(
  selector,
  disp
)(FeedScreen);
