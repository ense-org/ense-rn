// @flow
import type { EnseId, EnseJSON, FeedPath, PublicAccountJSON, PublicAccountId } from 'models/types';

export type HasRemoteCount = { remoteTotal: ?number };

export type FeedResponse = HasRemoteCount & {
  enses: [EnseId, EnseJSON],
};

// [subscriptionDate, info, receiveNotifsFrom]
export type AccountPayload = [string, PublicAccountJSON, boolean];

export type AccountResponse = { subscriptionList: AccountPayload[] };

export type {
  EnseJSON,
  FeedJSON,
  EnseId,
  FeedPath,
  PublicAccountJSON,
  PublicAccountId,
} from 'models/types';
