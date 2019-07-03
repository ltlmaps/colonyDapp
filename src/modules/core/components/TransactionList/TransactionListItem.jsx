/* @flow */

// $FlowFixMe
import React, { useCallback } from 'react';
import { defineMessages, FormattedDate } from 'react-intl';

import type { ColonyType, TokenType, UserType } from '~immutable';

import { TableRow, TableCell } from '~core/Table';
import { ActionButton } from '~core/Button';
import Numeral from '~core/Numeral';
import Icon from '~core/Icon';
import TransactionLink from '~core/TransactionLink';
import { ACTIONS } from '~redux';
import { mergePayload } from '~utils/actions';
import { useDataFetcher, useSelector } from '~utils/hooks';

import { colonyFetcher, tokenFetcher } from '../../../dashboard/fetchers';
import { userFetcher } from '../../../users/fetchers';
import { walletAddressSelector } from '../../../users/selectors';

import TransactionDetails from './TransactionDetails.jsx';

import styles from './TransactionListItem.css';

const MSG = defineMessages({
  buttonClaim: {
    id: 'admin.TransactionList.TransactionListItem.buttonClaim',
    defaultMessage: 'Claim',
  },
  buttonEtherscan: {
    id: 'admin.TransactionList.TransactionListItem.buttonEtherscan',
    defaultMessage: 'Etherscan',
  },
  incomingTransactionTitle: {
    id: 'admin.TransactionList.TransactionListItem.incomingTransactionTitle',
    defaultMessage: 'Incoming Transaction',
  },
  outgoingTransactionTitle: {
    id: 'admin.TransactionList.TransactionListItem.outgoingTransactionTitle',
    defaultMessage: 'Outgoing Transaction',
  },
});

const displayName = 'admin.TransactionList.TransactionListItem';

type Props = {|
  /*
   * The given contract transaction.
   */
  // transaction: NormalizedEvent,
  transaction: *,
  /*
   * User and colony addresses will always be shown; this controls whether the
   * address is shown in full, or masked.
   */
  showMaskedAddress?: boolean,
  /*
   * If to show the button to link to etherscan (or not). If this is not set,
   * it will not be possible to claim the transaction, as the button will
   * not be visible.
   */
  linkToEtherscan: boolean,
|};

const TransactionListItem = ({
  linkToEtherscan,
  showMaskedAddress = true,
  transaction: {
    type,
    payload,
    meta: { sourceId, actorId, timestamp },
  },
  transaction,
}: Props) => {
  const walletAddress = useSelector(walletAddressSelector);

  const { data: user } = useDataFetcher<UserType>(
    userFetcher,
    [actorId],
    [actorId],
  );

  const { data: token } = useDataFetcher<TokenType>(
    tokenFetcher,
    [sourceId],
    [sourceId],
  );

  const { data: colony } = useDataFetcher<ColonyType>(
    colonyFetcher,
    [sourceId],
    [sourceId],
  );

  const transform = useCallback(
    mergePayload({
      colonyAddress: colony && colony.colonyAddress,
      tokenAddress: token && token.address,
    }),
    [colony, token],
  );

  return (
    <TableRow className={styles.main}>
      <TableCell className={styles.transactionDate}>
        <div className={styles.dateDay}>
          <FormattedDate value={new Date(timestamp)} day="numeric" />
        </div>
        <div className={styles.dateMonth}>
          <FormattedDate value={new Date(timestamp)} month="short" />
        </div>
      </TableCell>
      <TableCell className={styles.transactionStatus}>
        {actorId === walletAddress ? (
          <Icon
            name="circle-arrow-down"
            title={MSG.incomingTransactionTitle}
            appearance={{ size: 'medium' }}
          />
        ) : (
          <Icon
            name="circle-arrow-back"
            title={MSG.outgoingTransactionTitle}
            appearance={{ size: 'medium' }}
          />
        )}
      </TableCell>
      <TableCell className={styles.transactionDetails}>
        <p>
          {type}: {colony && colony.colonyName}{' '}
          {user && user.profile && user.profile.username} {token && token.name}
        </p>
      </TableCell>
      <TableCell className={styles.transactionAmountActions}>
        {!linkToEtherscan && colony && token && (
          <div className={styles.buttonWrapper}>
            <ActionButton
              text={MSG.buttonClaim}
              className={styles.customButton}
              submit={ACTIONS.COLONY_CLAIM_TOKEN}
              error={ACTIONS.COLONY_CLAIM_TOKEN_ERROR}
              success={ACTIONS.COLONY_CLAIM_TOKEN_SUCCESS}
              transform={transform}
            />
          </div>
        )}
        {linkToEtherscan && (
          <div className={styles.etherscanButtonWrapper}>
            <TransactionLink
              className={styles.customButton}
              hash={sourceId}
              text={MSG.buttonEtherscan}
            />
          </div>
        )}
        <Numeral
          value={payload.amount || payload.transactionFee}
          unit="ether"
          truncate={3}
          suffix={` ${(token && token.symbol) || 'ETH'}`}
        />
      </TableCell>
    </TableRow>
  );
};

TransactionListItem.displayName = displayName;

export default TransactionListItem;
