import { List, fromJS } from 'immutable';
import { InboxItemRecord } from '~immutable';
import { USERS_NAMESPACE as ns } from '../../constants';

import { inboxItemsSelector } from '../user';

jest.mock('../../../users/selectors', () => ({
  walletAddressSelector: () => '0xdeadbeef',
}));

describe('Transaction selectors', () => {
  const activity1 = {
    id: 'rS0zYDCGtRaYAks7qTX3X',
    event: 'iceCreamInTheFridge',
    timestamp: '2019-05-24T11:09:15.980Z',
    colonyName: 're',
    colonyAddress: '0xEc46E0d7208FF021CDb5B9D47196adb8bbe07a3D',
    sourceUserAddress: '0xb77D57F4959eAfA0339424b83FcFaf9c15407461',
  };
  const activity2 = {
    id: 'rS0zYDCGtRaYAks7qTX3Y',
    event: 'dinnerReady',
    timestamp: '2019-05-27T11:09:15.980Z',
    colonyName: 're',
    colonyAddress: '0xEc46E0d7208FF021CDb5B9D47196adb8bbe07a3D',
    sourceUserAddress: '0xb77D57F4959eAfA0339424b83FcFaf9c15407461',
  };

  const state = fromJS({
    [ns]: {
      currentUser: {
        activities: List([
          InboxItemRecord(activity1),
          InboxItemRecord(activity2),
        ]),
      },
    },
  });

  test('inboxItems selector', () => {
    const found = inboxItemsSelector(state);
    const result = found.toJS();

    expect(result[0].colonyAddress).toEqual(
      '0xEc46E0d7208FF021CDb5B9D47196adb8bbe07a3D',
    );

    expect(result[0].event).toEqual('iceCreamInTheFridge');
  });
});