// @flow
import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';

export default () => {
  const { manifest } = Constants;
  return (
    <View style={styles.titleContainer}>
      <View style={styles.titleIconContainer}>
        <AppIconPreview iconUrl={manifest.iconUrl} />
      </View>
      <View>
        <Text style={styles.nameText} numberOfLines={1}>
          {manifest.name}
        </Text>
        <Text style={styles.slugText} numberOfLines={1}>
          {manifest.slug}
        </Text>
        <Text style={styles.descriptionText}>{manifest.description}</Text>
      </View>
    </View>
  );
};

const AppIconPreview = ({ iconUrl }) => (
  <Image source={{ uri: iconUrl }} style={{ width: 64, height: 64 }} resizeMode="cover" />
);

const styles = StyleSheet.create({
  titleContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
  },
  titleIconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  nameText: {
    fontWeight: '600',
    fontSize: 18,
  },
  slugText: {
    color: '#a39f9f',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 6,
    color: '#4d4d4d',
  },
});
