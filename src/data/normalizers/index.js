/* @flow */

import type BigNumber from 'bn.js';

import type { Event } from '../types';
import { VERSION } from '../constants';

export const CONTRACT_EVENT_SOURCE = 'contract';
export const DDB_EVENT_SOURCE = 'ddb';
export const TRANSACTION_EVENT_SOURCE = 'transaction';
// const GITHUB_SOURCE_TYPE
// const OTHER_3RD_PARTY_SOURCE_TYPE

opaque type EVENT_SOURCE_TYPE = 'contract' | 'ddb' | 'transaction';

type NormalizedEvent = {|
  type: string, // Event type a.k.a event name
  payload: Object, // Orbit-db entry payload value or parsed tx log topics
  meta: {|
    id: string, // Orbit payload id or txHash_logIndex for tx logs
    sourceId: string, // Orbit store address or log transaction hash
    sourceType: EVENT_SOURCE_TYPE, // See above
    actorId: string, // Wallet address for orbit-db events or tx sender address for tx logs
    targetId?: string,
    timestamp: number,
    version: typeof VERSION,
  |},
|};

type TransactionLog = {|
  event: { eventName: string },
  log: {
    logIndex: number,
    transactionHash: string,
  },
  timestamp: number,
  transaction: {
    from: string,
    gasPrice: BigNumber,
  },
  receipt: {
    gasUsed: BigNumber,
  },
|};

export const normalizeDDBStoreEvent = (
  storeAddress: string,
  {
    identity: { id: actorId },
    payload: {
      type,
      value: args,
      meta: { timestamp, id },
    },
  }: Event<*>,
): NormalizedEvent => ({
  type,
  payload: args,
  meta: {
    id,
    sourceType: DDB_EVENT_SOURCE,
    sourceId: storeAddress,
    actorId,
    timestamp,
    version: VERSION,
  },
});

export const normalizeTransactionLog = (
  contractAddress: string,
  {
    event: { eventName: type, ...args },
    log: { logIndex, transactionHash },
    timestamp,
    transaction: { from },
  }: TransactionLog,
): NormalizedEvent => ({
  type,
  payload: args,
  meta: {
    id: `${transactionHash}_${logIndex}`,
    sourceType: CONTRACT_EVENT_SOURCE,
    sourceId: contractAddress,
    actorId: from,
    timestamp,
    version: VERSION,
  },
});

export const normalizeTransaction = (
  contractAddress: string,
  {
    event: { eventName, ...args },
    log: { logIndex, transactionHash },
    timestamp,
    transaction: { from, gasPrice },
    receipt: { gasUsed },
    functionName: type,
    functionParams,
  }: TransactionLog & { functionName: string, functionParams: Object },
): NormalizedEvent => ({
  type,
  payload: {
    ...args,
    ...functionParams,
    transactionFee: gasUsed.mul(gasPrice),
  },
  meta: {
    id: transactionHash,
    sourceType: TRANSACTION_EVENT_SOURCE,
    sourceId: contractAddress,
    actorId: from,
    targetId: args.to || args.worker,
    timestamp,
    version: VERSION,
  },
});

export const normalizeEvent = (
  eventSourceType: string,
): ((
  eventSourceId: string,
  data: TransactionLog | Event<*>,
) => NormalizedEvent) =>
  ({
    CONTRACT_EVENT_SOURCE: normalizeTransactionLog,
    DDB_EVENT_SOURCE: normalizeDDBStoreEvent,
    TRANSACTION_EVENT_SOURCE: normalizeTransaction,
  }[eventSourceType]);
