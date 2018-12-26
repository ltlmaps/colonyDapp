/* @flow */

import { connect } from 'react-redux';
import { compose } from 'recompose';

import { singleColonySelector } from '../../dashboard/selectors';
import { fetchColony } from '../../dashboard/actionCreators';
import fetchMissingColony from './fetchMissingColony';

import type { ENSName } from '~types';

const withColony = compose(
  connect(
    (state, { ensName }: { ensName: ENSName }) => ({
      colony: singleColonySelector(state, ensName),
    }),
    {
      fetchColony,
    },
  ),
  fetchMissingColony,
);

export default withColony;