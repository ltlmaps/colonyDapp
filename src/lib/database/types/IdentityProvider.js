/* @flow */

import type { Identity } from './Identity';

export interface IdentityProvider<+T: Identity> {
  +_type: string;

  createIdentity(): Promise<T>;

  sign(identity: T, data: any): Promise<string>;

  verify(signature: string, publicKey: string, data: any): Promise<boolean>;
}