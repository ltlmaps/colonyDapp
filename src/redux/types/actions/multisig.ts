import {
  ActionTypeWithMeta,
  ActionTypeWithPayloadAndMeta,
  ActionTypes,
} from '~redux/index';
import { TransactionMultisig, TransactionType } from '~immutable/index';

type WithId = { id: string };

export type MultisigActionTypes =
  | ActionTypeWithPayloadAndMeta<
      ActionTypes.MULTISIG_TRANSACTION_CREATED,
      Pick<
        TransactionType,
        | 'context'
        | 'createdAt'
        | 'from'
        | 'group'
        | 'identifier'
        | 'methodContext'
        | 'methodName'
        | 'multisig'
        | 'options'
        | 'params'
        | 'parseEvents'
        | 'status'
      >,
      WithId
    >
  | ActionTypeWithPayloadAndMeta<
      ActionTypes.MULTISIG_TRANSACTION_REFRESHED,
      { multisig: TransactionMultisig },
      WithId
    >
  | ActionTypeWithMeta<ActionTypes.MULTISIG_TRANSACTION_REJECT, WithId>
  | ActionTypeWithMeta<ActionTypes.MULTISIG_TRANSACTION_SIGN, WithId>
  | ActionTypeWithMeta<ActionTypes.MULTISIG_TRANSACTION_SIGNED, WithId>;
