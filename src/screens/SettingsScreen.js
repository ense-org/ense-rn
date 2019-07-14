// @flow
import React from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';

type P = {||};
export default class SettingsScreen extends React.Component<P> {
  static navigationOptions = { title: 'empty' };

  render() {
    return (
      <SectionList
        style={styles.container}
        renderItem={this._renderItem}
        renderSectionHeader={this._renderSectionHeader}
        stickySectionHeadersEnabled
        keyExtractor={(item, index) => index}
        ListHeaderComponent={ListHeader}
        sections={[]}
      />
    );
  }

  _renderSectionHeader = ({ section }: any) => {
    return <SectionHeader title={section.title} />;
  };

  _renderItem = ({ item }: any) => {
    return (
      <SectionContent>
        <Text>{item.value}</Text>
      </SectionContent>
    );
  };
}

const ListHeader = () => {
  const { manifest } = Constants;
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.nameText} numberOfLines={1}>
        {manifest.name}
      </Text>
    </View>
  );
};

const SectionHeader = ({ title }: { title: string }) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
};

const SectionContent = (props: any) => {
  return <View>{props.children}</View>;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
