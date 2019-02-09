/* @flow */

import type { StoreBlueprint } from '~types/index';
import { EventStore } from '../../lib/database/stores';
import { getEthereumWalletStoreAccessController } from '../accessControllers';

const userMetadataStore: StoreBlueprint = {
  getAccessController: getEthereumWalletStoreAccessController,
  name: 'userMetadata',
  type: EventStore,
};

export default userMetadataStore;