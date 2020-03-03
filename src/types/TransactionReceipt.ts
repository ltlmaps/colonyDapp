import { $PropertyType } from 'utility-types';

import { ContractResponse } from '@area/colony-js-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContractResponseMeta = $PropertyType<ContractResponse<any>, 'meta'>;

export type TransactionReceipt = $PropertyType<ContractResponseMeta, 'receipt'>;
