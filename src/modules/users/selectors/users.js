/* @flow */

import { createSelector } from 'reselect';
import { Map as ImmutableMap } from 'immutable';

import type { RootStateRecord, UserPermissionsType } from '~immutable';
import type { ENSName } from '~types';

import {
  USERS_ALL_USERS,
  USERS_AVATARS,
  USERS_CURRENT_USER,
  USERS_CURRENT_USER_PROFILE,
  USERS_CURRENT_USER_TRANSACTIONS,
  USERS_CURRENT_USER_PERMISSIONS,
  USERS_NAMESPACE as ns,
  USERS_USERNAMES,
  USERS_USERS,
} from '../constants';

export const allUsers = (state: RootStateRecord) =>
  state.getIn([ns, USERS_ALL_USERS], ImmutableMap());

export const currentUser = (state: RootStateRecord) =>
  state.getIn([ns, USERS_CURRENT_USER]);

export const currentUserTransactions = (state: RootStateRecord) =>
  state.getIn([ns, USERS_CURRENT_USER, USERS_CURRENT_USER_TRANSACTIONS]);

export const allUsersSelector = (state: RootStateRecord) =>
  state.getIn([ns, USERS_ALL_USERS, USERS_USERS], ImmutableMap());

export const usernamesSelector = (state: RootStateRecord) =>
  state.getIn([ns, USERS_ALL_USERS, USERS_USERNAMES], ImmutableMap());

export const avatarsSelector = (state: RootStateRecord) =>
  state.getIn([ns, USERS_ALL_USERS, USERS_AVATARS], ImmutableMap());

export const usernameFromRouter = (state: RootStateRecord, props: Object) =>
  props.match.params.username;

export const usernameFromProps = (state: RootStateRecord, props: Object) =>
  props.username;

export const userAddressFromProps = (state: RootStateRecord, props: Object) =>
  props.userAddress;

// TODO improve the performance of these selectors (don't combine selectors if not needed)
export const usernameFromAddressProp = createSelector(
  usernamesSelector,
  userAddressFromProps,
  (usernames, userAddress) => usernames.get(userAddress),
);

export const routerUserSelector = createSelector(
  allUsersSelector,
  usernameFromRouter,
  (users, username) => users.get(username),
);

export const userSelector = createSelector(
  allUsersSelector,
  usernameFromProps,
  (users, username) => users.get(username),
);

export const currentUserAddressSelector = (state: RootStateRecord) =>
  state.getIn([
    ns,
    USERS_CURRENT_USER,
    USERS_CURRENT_USER_PROFILE,
    'walletAddress',
  ]);

export const currentUserBalanceSelector = (state: RootStateRecord) =>
  state.getIn(
    [ns, USERS_CURRENT_USER, USERS_CURRENT_USER_PROFILE, 'balance'],
    0,
  );

export const userFromAddressSelector = createSelector(
  allUsersSelector,
  usernameFromAddressProp,
  (users, username) => users.get(username),
);

export const avatarSelector = createSelector(
  avatarsSelector,
  (state, { user }) => user && user.getIn(['record', 'profile', 'username']),
  (avatars, username) => avatars.get(username),
);

export const usernameSelector = (state: RootStateRecord) =>
  state.getIn([ns, USERS_CURRENT_USER, USERS_CURRENT_USER_PROFILE, 'username']);

export const userColonyPermissionsSelector = (
  state: RootStateRecord,
  ensName: ENSName,
) =>
  state.getIn([
    ns,
    USERS_CURRENT_USER,
    USERS_CURRENT_USER_PERMISSIONS,
    ensName,
  ]);

export const canEnterRecoveryMode = (permissions?: UserPermissionsType) =>
  !!(permissions && permissions.canEnterRecoveryMode);
