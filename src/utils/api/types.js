// @flow
import type {
  EnseId,
  EnseJSON,
  FeedPath,
  PublicAccountJSON,
  AccountId,
  AccountHandle,
} from 'models/types';

export type HasRemoteCount = {| remoteTotal: ?number |};

export type EnseTuple = [EnseId, EnseJSON];
export type FeedResponse = {
  ...HasRemoteCount,
  enses: EnseTuple[],
};

// [subscriptionDate, info, receiveNotifsFrom]
export type AccountPayload = [string, PublicAccountJSON, boolean];

export type ListensPayload = [string, PublicAccountJSON][];

export type Topic = { displayname: string, postCount: number, tag: string };
export type TrendingTopics = { topiclist: Topic[] };

export type AccountResponse = { subscriptionList: AccountPayload[] };
export type NewEnseResponse = {
  contents: {
    dbKey: EnseId,
    uploadKey: string,
    policyBundle: {
      policyDoc: string,
      signature: string,
    },
  },
};

export type {
  EnseJSON,
  FeedJSON,
  EnseId,
  FeedPath,
  PublicAccountJSON,
  AccountId,
  AccountHandle,
} from 'models/types';
