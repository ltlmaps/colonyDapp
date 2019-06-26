/* @flow */

import type { Saga } from 'redux-saga';
import { push } from 'connected-react-router';

import {
  call,
  delay,
  fork,
  put,
  select,
  takeEvery,
  takeLatest,
  setContext,
  all,
} from 'redux-saga/effects';

import type { Action } from '~redux';
import { getContext, CONTEXT } from '~context';

import {
  executeQuery,
  executeCommand,
  putError,
  selectAsJS,
  takeFrom,
} from '~utils/saga/effects';
import { ACTIONS } from '~redux';

import { NETWORK_CONTEXT } from '../../../lib/ColonyManager/constants';
import {
  walletAddressSelector,
  currentUserMetadataSelector,
  currentUserColoniesSelector,
} from '../selectors';

import { ipfsUpload } from '../../core/sagas/ipfs';
import {
  transactionAddParams,
  transactionReady,
} from '../../core/actionCreators';

import {
  updateTokens,
  createUserProfile,
  removeUserAvatar,
  setUserAvatar,
  subscribeToColony,
  subscribeToTask,
  updateUserProfile,
  unsubscribeToColony,
} from '../data/commands';
import {
  checkUsernameIsAvailable,
  getUserBalance,
  getUserColonies,
  getUserColonyTransactions,
  getUserPermissions,
  getUserProfile,
  getUserTasks,
  getUserTokens,
  getUserInboxActivity,
  getUserNotificationMetadata,
} from '../data/queries';
import { createTransaction, getTxChannel } from '../../core/sagas/transactions';
import { userFetch as userFetchActionCreator } from '../actionCreators';

function* userTokenTransfersFetch(
  // eslint-disable-next-line no-unused-vars
  action: Action<typeof ACTIONS.USER_TOKEN_TRANSFERS_FETCH>,
): Saga<void> {
  try {
    const userColonyAddresses = yield* selectAsJS(currentUserColoniesSelector);
    const transactions = yield* executeQuery(getUserColonyTransactions, {
      args: {
        walletAddress: yield select(walletAddressSelector),
        userColonyAddresses: userColonyAddresses.record || [],
      },
    });
    yield put<Action<typeof ACTIONS.USER_TOKEN_TRANSFERS_FETCH_SUCCESS>>({
      type: ACTIONS.USER_TOKEN_TRANSFERS_FETCH_SUCCESS,
      payload: { transactions },
    });
  } catch (error) {
    yield putError(ACTIONS.USER_TOKEN_TRANSFERS_FETCH_ERROR, error);
  }
}

function* userByUsernameFetch({
  payload: { username },
}: Action<typeof ACTIONS.USER_BY_USERNAME_FETCH>): Saga<void> {
  try {
    const { networkClient } = yield* getContext(CONTEXT.COLONY_MANAGER);
    const ens = yield* getContext(CONTEXT.ENS_INSTANCE);
    const userAddress = yield call(
      [ens, ens.getAddress],
      ens.constructor.getFullDomain('user', username),
      networkClient,
    );
    yield put(userFetchActionCreator(userAddress));
  } catch (error) {
    yield putError(ACTIONS.USER_FETCH_ERROR, error);
  }
}

function* userFetch({
  meta,
  payload: { userAddress },
}: Action<typeof ACTIONS.USER_FETCH>): Saga<void> {
  try {
    const user = yield* executeQuery(getUserProfile, {
      metadata: {
        walletAddress: userAddress,
      },
    });

    yield put<Action<typeof ACTIONS.USER_FETCH_SUCCESS>>({
      type: ACTIONS.USER_FETCH_SUCCESS,
      meta,
      payload: user,
    });
  } catch (error) {
    yield putError(ACTIONS.USER_FETCH_ERROR, error, meta);
  }
}

function* currentUserGetBalance(
  // eslint-disable-next-line no-unused-vars
  action: Action<typeof ACTIONS.CURRENT_USER_GET_BALANCE>,
): Saga<void> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    if (!walletAddress) {
      throw new Error('Could not get wallet address for current user');
    }

    const balance = yield* executeQuery(getUserBalance, {
      args: { walletAddress },
    });
    yield put<Action<typeof ACTIONS.CURRENT_USER_GET_BALANCE_SUCCESS>>({
      type: ACTIONS.CURRENT_USER_GET_BALANCE_SUCCESS,
      payload: { balance },
    });
  } catch (error) {
    yield putError(ACTIONS.CURRENT_USER_GET_BALANCE_ERROR, error);
  }
}
function* userProfileUpdate({
  meta,
  payload,
}: Action<typeof ACTIONS.USER_PROFILE_UPDATE>): Saga<void> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    yield* executeCommand(updateUserProfile, {
      metadata: {
        walletAddress,
      },
      args: payload,
    });

    const user = yield* executeQuery(getUserProfile, {
      metadata: {
        walletAddress,
      },
    });
    yield put<Action<typeof ACTIONS.USER_PROFILE_UPDATE_SUCCESS>>({
      type: ACTIONS.USER_PROFILE_UPDATE_SUCCESS,
      meta,
      payload: user,
    });
  } catch (error) {
    yield putError(ACTIONS.USER_PROFILE_UPDATE_ERROR, error, meta);
  }
}
function* userAvatarRemove({
  meta,
}: Action<typeof ACTIONS.USER_AVATAR_REMOVE>): Saga<void> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    yield* executeCommand(removeUserAvatar, {
      metadata: {
        walletAddress,
      },
    });

    yield put<Action<typeof ACTIONS.USER_AVATAR_REMOVE_SUCCESS>>({
      type: ACTIONS.USER_AVATAR_REMOVE_SUCCESS,
      payload: { address: walletAddress },
      meta,
    });
  } catch (error) {
    yield putError(ACTIONS.USER_AVATAR_REMOVE_ERROR, error, meta);
  }
}
function* userAvatarUpload({
  meta,
  payload,
}: Action<typeof ACTIONS.USER_AVATAR_UPLOAD>): Saga<void> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    const ipfsHash = yield call(ipfsUpload, payload.data);
    yield* executeCommand(setUserAvatar, {
      metadata: {
        walletAddress,
      },
      args: { ipfsHash },
    });

    yield put<Action<typeof ACTIONS.USER_AVATAR_UPLOAD_SUCCESS>>({
      type: ACTIONS.USER_AVATAR_UPLOAD_SUCCESS,
      meta,
      payload: {
        hash: ipfsHash,
        avatar: payload.data,
        address: walletAddress,
      },
    });
  } catch (error) {
    yield putError(ACTIONS.USER_AVATAR_UPLOAD_ERROR, error, meta);
  }
}
function* usernameCheckAvailability({
  meta,
  payload: { username },
}: Action<typeof ACTIONS.USERNAME_CHECK_AVAILABILITY>): Saga<void> {
  try {
    yield delay(300);

    const isAvailable = yield* executeQuery(checkUsernameIsAvailable, {
      args: { username },
    });

    if (!isAvailable) {
      throw new Error(`ENS address for user "${username}" already exists`);
    }

    yield put<Action<typeof ACTIONS.USERNAME_CHECK_AVAILABILITY_SUCCESS>>({
      type: ACTIONS.USERNAME_CHECK_AVAILABILITY_SUCCESS,
      meta,
      payload: undefined,
    });
  } catch (error) {
    yield putError(ACTIONS.USERNAME_CHECK_AVAILABILITY_ERROR, error, meta);
  }
}

function* usernameCreate({
  meta: { id },
  meta,
  payload: { username },
}: Action<typeof ACTIONS.USERNAME_CREATE>): Saga<*> {
  const txChannel = yield call(getTxChannel, id);
  try {
    yield fork(createTransaction, id, {
      context: NETWORK_CONTEXT,
      methodName: 'registerUserLabel',
      ready: false,
      params: { username },
      group: {
        key: 'transaction.batch.createUser',
        id,
        index: 0,
      },
    });

    const walletAddress = yield select(walletAddressSelector);
    const { profileStore, metadataStore, inboxStore } = yield* executeCommand(
      createUserProfile,
      {
        args: { username, walletAddress },
        metadata: { walletAddress },
      },
    );

    const orbitDBPath = profileStore.address.toString();
    yield put(transactionAddParams(id, { orbitDBPath }));
    yield put(transactionReady(id));

    yield takeFrom(txChannel, ACTIONS.TRANSACTION_SUCCEEDED);
    yield put<Action<typeof ACTIONS.USERNAME_CREATE_SUCCESS>>({
      type: ACTIONS.USERNAME_CREATE_SUCCESS,
      payload: {
        inboxStoreAddress: inboxStore.address.toString(),
        metadataStoreAddress: metadataStore.address.toString(),
        username,
      },
      meta,
    });
  } catch (error) {
    return yield putError(ACTIONS.USERNAME_CREATE_ERROR, error, meta);
  } finally {
    txChannel.close();
  }
  return null;
}

function* userLogout(): Saga<void> {
  const ddb = yield* getContext(CONTEXT.DDB_INSTANCE);

  try {
    /*
     *  1. Destroy instances of colonyJS in the colonyManager? Probably.
     */
    yield setContext({
      [CONTEXT.COLONY_MANAGER]: undefined,
    });

    /*
     *  2. The purser wallet is reset
     */
    yield setContext({ [CONTEXT.WALLET]: undefined });
    /*
     *  3. Close orbit store
     */
    yield call([ddb, ddb.stop]);

    yield all([
      put<Action<typeof ACTIONS.USER_LOGOUT_SUCCESS>>({
        type: ACTIONS.USER_LOGOUT_SUCCESS,
      }),
      put(push(`/dashboard`)),
    ]);
  } catch (error) {
    yield putError(ACTIONS.USER_LOGOUT_ERROR, error);
  }
}

function* userPermissionsFetch({
  payload: { colonyAddress },
  meta,
}: Action<typeof ACTIONS.USER_PERMISSIONS_FETCH>): Saga<void> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    if (!walletAddress) {
      throw new Error('Could not get wallet address for current user');
    }
    const permissions = yield* executeQuery(getUserPermissions, {
      metadata: { colonyAddress },
      args: { walletAddress },
    });
    yield put<Action<typeof ACTIONS.USER_PERMISSIONS_FETCH_SUCCESS>>({
      type: ACTIONS.USER_PERMISSIONS_FETCH_SUCCESS,
      payload: { permissions, colonyAddress },
      meta,
    });
  } catch (error) {
    yield putError(ACTIONS.USER_PERMISSIONS_FETCH_ERROR, error, meta);
  }
}
function* userTokensFetch(): Saga<void> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    const { metadataStoreAddress } = yield select(currentUserMetadataSelector);
    const metadata = {
      walletAddress,
      metadataStoreAddress,
    };
    const tokens = yield* executeQuery(getUserTokens, {
      metadata,
      args: {
        walletAddress,
      },
    });
    yield put<Action<typeof ACTIONS.USER_TOKENS_FETCH_SUCCESS>>({
      type: ACTIONS.USER_TOKENS_FETCH_SUCCESS,
      payload: { tokens },
    });
  } catch (error) {
    yield putError(ACTIONS.USER_TOKENS_FETCH_ERROR, error);
  }
}
/**
 * Diff the current user tokens and the list sent as payload, and work out
 * which tokens need adding and which need removing. Then append the relevant
 * events to the user metadata store.
 */
function* userTokensUpdate(
  action: Action<typeof ACTIONS.USER_TOKENS_UPDATE>,
): Saga<void> {
  try {
    const { tokens } = action.payload;
    const walletAddress = yield select(walletAddressSelector);
    const { metadataStoreAddress } = yield select(currentUserMetadataSelector);
    const metadata = {
      walletAddress,
      metadataStoreAddress,
    };
    yield* executeCommand(updateTokens, {
      metadata,
      args: { tokens },
    });

    yield put({ type: ACTIONS.USER_TOKENS_FETCH });
    yield put({ type: ACTIONS.USER_TOKENS_UPDATE_SUCCESS });
  } catch (error) {
    yield putError(ACTIONS.USER_TOKENS_UPDATE_ERROR, error);
  }
}
function* userSubscribedColoniesFetch(): Saga<*> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    const { metadataStoreAddress } = yield select(currentUserMetadataSelector);
    const colonyAddresses = yield* executeQuery(getUserColonies, {
      metadata: {
        walletAddress,
        metadataStoreAddress,
      },
    });
    yield put<Action<typeof ACTIONS.USER_SUBSCRIBED_COLONIES_FETCH_SUCCESS>>({
      type: ACTIONS.USER_SUBSCRIBED_COLONIES_FETCH_SUCCESS,
      payload: colonyAddresses,
    });
  } catch (error) {
    yield putError(ACTIONS.USER_SUBSCRIBED_COLONIES_FETCH_SUCCESS, error);
  }
}

function* userColonySubscribe({
  payload,
  meta,
}: Action<typeof ACTIONS.USER_COLONY_SUBSCRIBE>): Saga<*> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    const { metadataStoreAddress } = yield select(currentUserMetadataSelector);
    const metadata = {
      walletAddress,
      metadataStoreAddress,
    };
    const userColonyAddresses = yield* executeQuery(getUserColonies, {
      metadata,
    });
    yield* executeCommand(subscribeToColony, {
      args: { ...payload, userColonyAddresses },
      metadata,
    });
    yield put<Action<typeof ACTIONS.USER_COLONY_SUBSCRIBE_SUCCESS>>({
      type: ACTIONS.USER_COLONY_SUBSCRIBE_SUCCESS,
      payload,
      meta,
    });
  } catch (caughtError) {
    yield putError(ACTIONS.USER_COLONY_SUBSCRIBE_ERROR, caughtError, meta);
  }
}

function* userColonyUnsubscribe({
  payload,
  meta,
}: Action<typeof ACTIONS.USER_COLONY_UNSUBSCRIBE>): Saga<*> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    const { metadataStoreAddress } = yield select(currentUserMetadataSelector);
    const metadata = {
      walletAddress,
      metadataStoreAddress,
    };
    const userColonyAddresses = yield* executeQuery(getUserColonies, {
      metadata,
    });

    yield* executeCommand(unsubscribeToColony, {
      args: { ...payload, userColonyAddresses },
      metadata,
    });
    yield put<Action<typeof ACTIONS.USER_COLONY_UNSUBSCRIBE_SUCCESS>>({
      type: ACTIONS.USER_COLONY_UNSUBSCRIBE_SUCCESS,
      payload,
      meta,
    });
  } catch (caughtError) {
    yield putError(ACTIONS.USER_COLONY_UNSUBSCRIBE_ERROR, caughtError, meta);
  }
}

function* userSubscribedTasksFetch(): Saga<*> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    const { metadataStoreAddress } = yield select(currentUserMetadataSelector);
    const metadata = {
      walletAddress,
      metadataStoreAddress,
    };
    const userTasks = yield* executeQuery(getUserTasks, {
      metadata,
    });
    yield put<Action<typeof ACTIONS.USER_SUBSCRIBED_TASKS_FETCH_SUCCESS>>({
      type: ACTIONS.USER_SUBSCRIBED_TASKS_FETCH_SUCCESS,
      payload: userTasks,
    });
  } catch (error) {
    yield putError(ACTIONS.USER_SUBSCRIBED_TASKS_FETCH_ERROR, error);
  }
}
function* userTaskSubscribe({
  payload,
}: Action<typeof ACTIONS.USER_TASK_SUBSCRIBE>): Saga<*> {
  try {
    const walletAddress = yield select(walletAddressSelector);
    const { metadataStoreAddress } = yield select(currentUserMetadataSelector);
    const metadata = {
      walletAddress,
      metadataStoreAddress,
    };
    const userDraftIds = yield* executeQuery(getUserTasks, {
      metadata,
    });
    if (
      yield* executeCommand(subscribeToTask, {
        args: { ...payload, userDraftIds },
        metadata,
      })
    ) {
      yield put<Action<typeof ACTIONS.USER_TASK_SUBSCRIBE_SUCCESS>>({
        type: ACTIONS.USER_TASK_SUBSCRIBE_SUCCESS,
        payload,
      });
    }
  } catch (error) {
    yield putError(ACTIONS.USER_TASK_SUBSCRIBE_ERROR, error);
  }
}

function* inboxItemsFetch({
  payload: { walletAddress },
  meta,
}: Action<typeof ACTIONS.INBOX_ITEMS_FETCH>): Saga<void> {
  try {
    const { inboxStoreAddress, metadataStoreAddress } = yield select(
      currentUserMetadataSelector,
    );
    const userColonies = yield* executeQuery(getUserColonies, {
      metadata: {
        walletAddress,
        metadataStoreAddress,
      },
    });

    const { readUntil = 0, exceptFor = [] } = yield* executeQuery(
      getUserNotificationMetadata,
      {
        metadata: {
          walletAddress,
          metadataStoreAddress,
        },
      },
    );

    // @todo (reactivity) Make metadata and user inbox data reactive
    yield put<Action<typeof ACTIONS.USER_NOTIFICATION_METADATA_FETCH_SUCCESS>>({
      type: ACTIONS.USER_NOTIFICATION_METADATA_FETCH_SUCCESS,
      payload: {
        readUntil,
        exceptFor,
      },
    });

    const activities = yield* executeQuery(getUserInboxActivity, {
      metadata: { inboxStoreAddress, walletAddress, userColonies },
    });

    yield put<Action<typeof ACTIONS.INBOX_ITEMS_FETCH_SUCCESS>>({
      type: ACTIONS.INBOX_ITEMS_FETCH_SUCCESS,
      payload: { activities },
      meta,
    });
  } catch (error) {
    yield putError(ACTIONS.INBOX_ITEMS_FETCH_ERROR, error, meta);
  }
}

export default function* setupUsersSagas(): Saga<void> {
  yield takeEvery(ACTIONS.USER_FETCH, userFetch);
  yield takeEvery(ACTIONS.USER_BY_USERNAME_FETCH, userByUsernameFetch);
  yield takeEvery(ACTIONS.USER_PERMISSIONS_FETCH, userPermissionsFetch);
  yield takeEvery(ACTIONS.USER_TOKEN_TRANSFERS_FETCH, userTokenTransfersFetch);
  yield takeEvery(ACTIONS.USER_TOKENS_FETCH, userTokensFetch);
  yield takeEvery(ACTIONS.USER_COLONY_SUBSCRIBE, userColonySubscribe);
  yield takeEvery(ACTIONS.USER_COLONY_UNSUBSCRIBE, userColonyUnsubscribe);
  yield takeEvery(
    ACTIONS.USER_SUBSCRIBED_TASKS_FETCH,
    userSubscribedTasksFetch,
  );
  yield takeEvery(ACTIONS.USER_TASK_SUBSCRIBE, userTaskSubscribe);
  yield takeEvery(
    ACTIONS.USER_SUBSCRIBED_COLONIES_FETCH,
    userSubscribedColoniesFetch,
  );
  yield takeEvery(ACTIONS.INBOX_ITEMS_FETCH, inboxItemsFetch);
  yield takeLatest(
    ACTIONS.USERNAME_CHECK_AVAILABILITY,
    usernameCheckAvailability,
  );
  yield takeLatest(ACTIONS.USER_LOGOUT, userLogout);
  yield takeLatest(ACTIONS.USERNAME_CREATE, usernameCreate);
  yield takeLatest(ACTIONS.CURRENT_USER_GET_BALANCE, currentUserGetBalance);
  yield takeLatest(ACTIONS.USER_PROFILE_UPDATE, userProfileUpdate);
  yield takeLatest(ACTIONS.USER_AVATAR_REMOVE, userAvatarRemove);
  yield takeLatest(ACTIONS.USER_AVATAR_UPLOAD, userAvatarUpload);
  yield takeLatest(ACTIONS.USER_TOKENS_UPDATE, userTokensUpdate);
}
