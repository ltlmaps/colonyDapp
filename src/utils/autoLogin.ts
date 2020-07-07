import { useState, useEffect } from 'react';
import { open } from '@purser/metamask';

import { WalletMethod } from '~immutable/index';
import { Address } from '~types/index';
import { createAddress } from '~utils/web3';
import { ActionTypes } from '~redux/index';

import { useAsyncFunction } from './hooks';
import { log } from './debug';

export const LAST_WALLET_KEY = 'colony-last-wallet-type';
export const LAST_ADDRESS_KEY = 'colony-last-wallet-address';

export const getLastWallet = () => ({
  type: localStorage.getItem(LAST_WALLET_KEY),
  address: localStorage.getItem(LAST_ADDRESS_KEY),
});

export const setLastWallet = (type: WalletMethod, address: Address) => {
  if (type !== WalletMethod.Ethereal) {
    localStorage.setItem(LAST_WALLET_KEY, type);
    localStorage.setItem(LAST_ADDRESS_KEY, address);
  }
};

export const clearLastWallet = () => {
  localStorage.removeItem(LAST_WALLET_KEY);
  localStorage.removeItem(LAST_ADDRESS_KEY);
};

export const useMetaMaskAutoLogin = (
  lastWalletType: string,
  lastWalletAddress: string,
) => {
  const login = useAsyncFunction({
    submit: ActionTypes.WALLET_CREATE,
    success: ActionTypes.USER_CONTEXT_SETUP_SUCCESS,
    error: ActionTypes.WALLET_CREATE_ERROR,
  });

  const [loading, setLoading] = useState(
    lastWalletType === WalletMethod.MetaMask,
  );

  useEffect(() => {
    (async () => {
      if (lastWalletType === WalletMethod.MetaMask) {
        try {
          const wallet = await open();
          if (
            createAddress(wallet.address) === createAddress(lastWalletAddress)
          ) {
            await login({ method: WalletMethod.MetaMask });
            return;
          }
        } catch (error) {
          log.error(error);
          log.debug('MetaMask auto login was attempted and failed');
        }

        clearLastWallet();
        setLoading(false);
      }
    })();
  }, [lastWalletType, lastWalletAddress, login]);

  return loading;
};

/**
 * Will attempt to automatically log the user in based on last used wallet type
 * and address saved in localstorage. Currently supports only MetaMask.
 */
export const useAutoLogin = () => {
  const { type, address } = getLastWallet();
  const loadingMetaMask = useMetaMaskAutoLogin(type || '', address || '');
  return loadingMetaMask;
};
