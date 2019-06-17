// @flow
import type {
  EnseId,
  EnseJSON,
  FeedPath,
  PublicAccountJSON,
  PublicAccountId,
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
  PublicAccountId,
  AccountHandle,
} from 'models/types';
