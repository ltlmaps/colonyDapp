import { Map as ImmutableMap, Record } from 'immutable';

import { CoreTransactions, TransactionRecord } from '~immutable';

import reducer from '../transactions';

import {
  createTxAction,
  transactionSent,
  transactionHashReceived,
  transactionEstimateError,
  transactionReceiptError,
  transactionSendError,
  transactionSucceeded,
  transactionReceiptReceived,
} from '../../actionCreators';

const testActions = (actions, initialState) =>
  actions.reduce((state, [action, assertions]) => {
    const newState = reducer(state, action);
    if (typeof assertions === 'function') assertions(newState);
    return newState;
  }, initialState);

describe(`core: reducers (transactions)`, () => {
  test('Initial state', () => {
    const newState = reducer(undefined, {
      type: 'NOT_SUPPORTED_BY_THIS_REDUCER',
    });
    expect(newState.list).toEqual(ImmutableMap());
  });

  const eventData = { myEventParam: 123 };
  const from = 'my wallet address';
  const hash = 'my transaction hash';
  const options = { gasPrice: 4 };
  const params = { param1: 123 };
  const id = 'my transaction id';
  const existingTxId = 'my existing tx id';
  const context = 'network';
  const methodName = 'createColony';

  const initialState = CoreTransactions({
    list: ImmutableMap({
      [existingTxId]: TransactionRecord({
        createdAt: new Date(2018, 0, 1),
      }),
    }),
    gasPrices: {},
  });

  // Actions

  const createdTx = createTxAction(id, from, {
    context,
    methodName,
    options,
    params,
  });

  const sentTx = transactionSent(id);
  const hashReceived = transactionHashReceived(id, { hash, params });
  const receiptReceived = transactionReceiptReceived(id, { receipt: { hash } });
  const eventDataReceived = transactionSucceeded(id, { eventData });

  const sendError = transactionSendError(id, new Error('oh no, send error'));
  const receiptError = transactionReceiptError(
    id,
    new Error('oh no, receipt error'),
  );
  const estimateError = transactionEstimateError(
    id,
    new Error('oh no, estimate error'),
  );

  test('Sends successfully', () => {
    testActions(
      [
        [
          createdTx,
          state => {
            // Ideally we should evaluate the state based on the whole map,
            // but jest has some unexpected results when using `toEqual`
            // with immutable maps.
            expect(state.list.size).toBe(2);

            const existingTx = state.list.get(existingTxId);
            expect(Record.isRecord(existingTx)).toBe(true);
            expect(existingTx.toJS()).toEqual(
              initialState.list.get(existingTxId).toJS(),
            );

            const tx = state.list.get(id);
            expect(Record.isRecord(tx)).toBe(true);
            expect(tx.toJS()).toEqual({
              context,
              createdAt: expect.any(Date),
              error: undefined,
              eventData: undefined,
              from,
              gasLimit: undefined,
              gasPrice: undefined,
              group: undefined,
              hash: undefined,
              id,
              methodName,
              options,
              params,
              receipt: undefined,
              /*
               * Initial status is set to `READY`
               */
              status: 'READY',
            });
          },
        ],
        [
          sentTx,
          state => {
            expect(state.list.size).toBe(2);

            const existingTx = state.list.get(existingTxId);
            expect(Record.isRecord(existingTx)).toBe(true);
            expect(existingTx.toJS()).toEqual(
              initialState.list.get(existingTxId).toJS(),
            );

            const tx = state.list.get(id);
            expect(Record.isRecord(tx)).toBe(true);
            expect(tx.toJS()).toEqual({
              context,
              createdAt: expect.any(Date),
              error: undefined,
              eventData: undefined,
              from,
              gasLimit: undefined,
              gasPrice: undefined,
              group: undefined,
              hash: undefined,
              id,
              methodName,
              options,
              params,
              receipt: undefined,
              /*
               * During sending the transaction is set to 'PENDING'
               */
              status: 'PENDING',
            });
          },
        ],
        [
          hashReceived,
          state => {
            expect(state.list.size).toBe(2);

            const existingTx = state.list.get(existingTxId);
            expect(Record.isRecord(existingTx)).toBe(true);
            expect(existingTx.toJS()).toEqual(
              initialState.list.get(existingTxId).toJS(),
            );

            const tx = state.list.get(id);
            expect(Record.isRecord(tx)).toBe(true);
            expect(tx.toJS()).toEqual({
              context,
              createdAt: expect.any(Date),
              error: undefined,
              eventData: undefined,
              from,
              gasLimit: undefined,
              gasPrice: undefined,
              group: undefined,
              hash, // Hash should have been set
              id,
              methodName,
              options,
              params,
              receipt: undefined,
              /*
               * During sending the transaction is set to 'PENDING'
               */
              status: 'PENDING',
            });
          },
        ],
        [
          receiptReceived,
          state => {
            expect(state.list.size).toBe(2);

            const existingTx = state.list.get(existingTxId);
            expect(Record.isRecord(existingTx)).toBe(true);
            expect(existingTx.toJS()).toEqual(
              initialState.list.get(existingTxId).toJS(),
            );

            const tx = state.list.get(id);
            expect(Record.isRecord(tx)).toBe(true);
            expect(tx.toJS()).toEqual({
              context,
              createdAt: expect.any(Date),
              error: undefined,
              eventData: undefined,
              from,
              gasLimit: undefined,
              gasPrice: undefined,
              group: undefined,
              hash,
              id,
              methodName,
              options,
              params,
              receipt: expect.any(Object), // should have been set
              status: 'PENDING',
            });
          },
        ],
        [
          eventDataReceived,
          state => {
            expect(state.list.size).toBe(2);

            const existingTx = state.list.get(existingTxId);
            expect(Record.isRecord(existingTx)).toBe(true);
            expect(existingTx.toJS()).toEqual(
              initialState.list.get(existingTxId).toJS(),
            );

            const tx = state.list.get(id);
            expect(Record.isRecord(tx)).toBe(true);
            expect(tx.toJS()).toEqual({
              context,
              createdAt: expect.any(Date),
              error: undefined,
              eventData, // should have been set
              from,
              gasLimit: undefined,
              gasPrice: undefined,
              group: undefined,
              hash,
              id,
              methodName,
              options,
              params,
              receipt: expect.any(Object),
              /*
               * If it went through successfully, it's set to `SUCCEEDED`
               */
              status: 'SUCCEEDED',
            });
          },
        ],
      ],
      initialState,
    );
  });

  test('Handles send error', () => {
    testActions(
      [
        [createdTx],
        [
          sendError,
          state => {
            expect(state.list.size).toBe(2);

            const existingTx = state.list.get(existingTxId);
            expect(Record.isRecord(existingTx)).toBe(true);
            expect(existingTx.toJS()).toEqual(
              initialState.list.get(existingTxId).toJS(),
            );

            const tx = state.list.get(id);
            expect(Record.isRecord(tx)).toBe(true);
            expect(tx.toJS()).toEqual({
              context,
              createdAt: expect.any(Date),
              error: {
                type: 'SEND',
                message: 'oh no, send error',
              },
              eventData: undefined,
              from,
              gasLimit: undefined,
              gasPrice: undefined,
              group: undefined,
              hash: undefined,
              id,
              methodName,
              options,
              params,
              receipt: undefined,
              /*
               * If it failed, it's set to `failed`... obviously
               */
              status: 'FAILED',
            });
          },
        ],
      ],
      initialState,
    );
  });

  test('Handles receipt error', () => {
    testActions(
      [
        [createdTx],
        [sentTx],
        [hashReceived],
        [
          receiptError,
          state => {
            expect(state.list.size).toBe(2);

            const existingTx = state.list.get(existingTxId);
            expect(Record.isRecord(existingTx)).toBe(true);
            expect(existingTx.toJS()).toEqual(
              initialState.list.get(existingTxId).toJS(),
            );

            const tx = state.list.get(id);
            expect(Record.isRecord(tx)).toBe(true);
            expect(tx.toJS()).toEqual({
              context,
              createdAt: expect.any(Date),
              error: {
                type: 'RECEIPT',
                message: 'oh no, receipt error',
              },
              eventData: undefined,
              from,
              gasLimit: undefined,
              gasPrice: undefined,
              group: undefined,
              hash,
              id,
              methodName,
              options,
              params,
              receipt: undefined,
              /*
               * If it failed, it's set to `failed`... obviously
               */
              status: 'FAILED',
            });
          },
        ],
      ],
      initialState,
    );
  });

  test('Handles estimate error', () => {
    testActions(
      [
        [createdTx],
        [sentTx],
        [hashReceived],
        [receiptReceived],
        [
          estimateError,
          state => {
            expect(state.list.size).toBe(2);

            const existingTx = state.list.get(existingTxId);
            expect(Record.isRecord(existingTx)).toBe(true);
            expect(existingTx.toJS()).toEqual(
              initialState.list.get(existingTxId).toJS(),
            );

            const tx = state.list.get(id);
            expect(Record.isRecord(tx)).toBe(true);
            expect(tx.toJS()).toEqual({
              context,
              createdAt: expect.any(Date),
              error: {
                type: 'ESTIMATE',
                message: 'oh no, estimate error',
              },
              eventData: undefined,
              from,
              gasLimit: undefined,
              gasPrice: undefined,
              group: undefined,
              hash,
              id,
              methodName,
              options,
              params,
              receipt: expect.any(Object),
              /*
               * If it failed, it's set to `failed`... obviously
               */
              status: 'FAILED',
            });
          },
        ],
      ],
      initialState,
    );
  });
});
