/* @flow */

import type { ColonyClient as ColonyClientType } from '@colony/colony-js-client';
import type { WalletObjectType } from '@colony/purser-core/flowtypes';
import type { Address, StoreBlueprint } from '~types';

import { EventStore } from '~lib/database/stores';
import { ColonyAccessController } from '../accessControllers';
import loadPermissionManifest from '../permissions';

export type ColonyTaskIndexStoreProps = {|
  colonyAddress: Address,
  chainId: string,
  wallet: WalletObjectType,
  colonyClient: ColonyClientType,
|};

export const getColonyTaskIndexStoreAccessController = ({
  colonyAddress,
  colonyClient,
  wallet,
}: ColonyTaskIndexStoreProps) => {
  if (!colonyAddress)
    throw new Error(
      // eslint-disable-next-line max-len
      `Could not create access controller, invalid colony address: "${colonyAddress}"`,
    );
  if (!wallet)
    throw new Error(
      'Could not create access controller, a wallet object is required',
    );
  if (!colonyClient)
    throw new Error(
      'Could not create access controller, colony client is required',
    );

  const manifest = loadPermissionManifest(colonyClient);
  return new ColonyAccessController(colonyAddress, wallet, manifest);
};

export type ColonyTaskIndexStoreBlueprint = StoreBlueprint<
  ColonyTaskIndexStoreProps,
  ColonyAccessController,
>;

// eslint-disable-next-line max-len
const colonyTaskIndexStoreBlueprint: ColonyTaskIndexStoreBlueprint = Object.freeze(
  {
    getAccessController: getColonyTaskIndexStoreAccessController,
    getName: ({ chainId, colonyAddress }) =>
      `network.${chainId}.colony.${colonyAddress}.tasks`,
    type: EventStore,
  },
);

export default colonyTaskIndexStoreBlueprint;
