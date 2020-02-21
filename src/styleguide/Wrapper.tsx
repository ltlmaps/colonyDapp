import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import { Map as ImmutableMap, Record } from 'immutable';

import { Wallet, WALLET_CATEGORIES } from '~immutable/index';

import { CoreTransactions } from '../modules/core/state/index';

import '../styles/main.css';
import '../styles/styleguide.css';

import messages from '../i18n/en.json';

// @ts-ignore
if (!Intl.RelativeTimeFormat) {
  /* eslint-disable global-require */
  require('@formatjs/intl-relativetimeformat/polyfill');
  require('@formatjs/intl-relativetimeformat/dist/locale-data/en');
  /* eslint-enable global-require */
}

interface Props {
  children: ReactNode;
}

const MockState = Record({
  admin: undefined,
  core: undefined,
  dashboard: undefined,
  users: undefined,
});

// @ts-ignore
const initialState = MockState({
  admin: {
    transactions: ImmutableMap(),
    unclaimedTransactions: ImmutableMap(),
  },
  core: {
    transactions: CoreTransactions(),
  },
  dashboard: {
    allComments: ImmutableMap(),
    allDomains: ImmutableMap(),
    allDrafts: ImmutableMap(),
    tasks: ImmutableMap(),
    allColonies: {
      avatars: ImmutableMap(),
      colonies: ImmutableMap(),
      colonyNames: ImmutableMap(),
    },
  },
  users: {
    currentUser: {
      profile: {
        username: 'piglet',
        walletAddress: '0xdeadbeef',
        inboxStoreAddress: '',
        metadataStoreAddress: '',
      },
    },
    wallet: Wallet({
      walletType: WALLET_CATEGORIES.SOFTWARE,
    }),
    allUsers: ImmutableMap(),
  },
});

const configureStore = () => {
  const reducer = (state = initialState) => state;
  return createStore(reducer);
};

const store = configureStore();
// We're injecting ReactIntl into all of our components, even though it might not be needed everywhere
const Wrapper = ({ children }: Props) => (
  <Provider store={store}>
    <IntlProvider locale="en" defaultLocale="en" messages={messages}>
      <BrowserRouter>{children}</BrowserRouter>
    </IntlProvider>
  </Provider>
);

export default Wrapper;
