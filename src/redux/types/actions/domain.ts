import { BigNumber } from 'ethers/utils';
import { Address } from '~types/index';
import { OneDomain } from '~data/index';
import { ActionType, ErrorActionType, UniqueActionType } from './index';
import { ActionTypes } from '../../index';

export type DomainActionTypes =
  | UniqueActionType<
      ActionTypes.MOVE_FUNDS_BETWEEN_POTS,
      {
        colonyAddress: string;
        tokenAddress: string;
        fromDomain: number;
        toDomain: number;
        amount: BigNumber;
      },
      object
    >
  | ErrorActionType<ActionTypes.MOVE_FUNDS_BETWEEN_POTS_ERROR, object>
  | UniqueActionType<
      ActionTypes.MOVE_FUNDS_BETWEEN_POTS_SUCCESS,
      {
        tokenAddress: string;
        colonyAddress: string;
        fromPot: number;
        toPot: number;
        amount: BigNumber;
      },
      object
    >
  | UniqueActionType<
      ActionTypes.DOMAIN_CREATE,
      { colonyAddress: Address; domainName: string; parentDomainId?: number },
      object
    >
  | ErrorActionType<ActionTypes.DOMAIN_CREATE_ERROR, object>
  | UniqueActionType<
      ActionTypes.DOMAIN_CREATE_SUCCESS,
      { colonyAddress: string; domain: OneDomain },
      object
    >
  | ActionType<ActionTypes.DOMAIN_CREATE_TX>
  | ErrorActionType<ActionTypes.DOMAIN_CREATE_TX_ERROR, object>
  | ActionType<ActionTypes.DOMAIN_CREATE_TX_SUCCESS>
  | UniqueActionType<
      ActionTypes.DOMAIN_EDIT,
      {
        colonyAddress: Address;
        domainName: string;
        parentDomainId?: number;
        domainId: number;
      },
      null
    >
  | ErrorActionType<ActionTypes.DOMAIN_EDIT_ERROR, null>
  | UniqueActionType<
      ActionTypes.DOMAIN_EDIT_SUCCESS,
      {
        colonyAddress: string;
        domainId: number;
        domainName: string;
        parentId?: number;
      },
      null
    >;
