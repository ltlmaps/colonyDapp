/* @flow */

// $FlowFixMe upgrade flow
import React, { Fragment, useCallback } from 'react';
import { defineMessages } from 'react-intl';

import type { ColonyType } from '~immutable';
import type { Address } from '~types';

import Heading from '~core/Heading';
import CopyableAddress from '~core/CopyableAddress';
import {
  FieldSet,
  Input,
  InputLabel,
  Textarea,
  ActionForm,
  FormStatus,
} from '~core/Fields';
import Button from '~core/Button';
import { pipe, mergePayload, withKey } from '~utils/actions';
import { ACTIONS } from '~redux';

import { UpdateColonyProfileCommandArgsSchema } from '../../../dashboard/data/commands/schemas';
import ENS from '~lib/ENS';

import ColonyAvatarUploader from './ColonyAvatarUploader.jsx';

import styles from './ProfileEdit.css';

const MSG = defineMessages({
  labelAddress: {
    id: 'admin.Profile.ProfileEdit.labelAddress',
    defaultMessage: 'Colony Address',
  },
  sendTokens: {
    id: 'admin.Profile.ProfileEdit.sendTokens',
    defaultMessage: 'Send tokens to this address to fund your colony',
  },
  labelEnsName: {
    id: 'admin.Profile.ProfileEdit.labelEnsName',
    defaultMessage: 'Colony ENS',
  },
  labelDisplayName: {
    id: 'admin.Profile.ProfileEdit.labelDisplayName',
    defaultMessage: 'Colony Display Name',
  },
  labelAbout: {
    id: 'admin.Profile.ProfileEdit.labelAbout',
    defaultMessage: 'About',
  },
  labelTokenAddress: {
    id: 'admin.Profile.ProfileEdit.labelTokenAddress',
    defaultMessage: 'Token Address',
  },
  labelWebsite: {
    id: 'admin.Profile.ProfileEdit.labelWebsite',
    defaultMessage: 'Website',
  },
  labelGuidelines: {
    id: 'admin.Profile.ProfileEdit.labelGuidelines',
    defaultMessage: 'Contribution Guidelines URL',
  },
});

/*
 * This is due to `displayName` already being declared in the Component's scope
 */
const componentDisplayName: string = 'admin.Profile.ProfileEdit';

type Props = {|
  colony: ColonyType,
|};

const ProfileEdit = ({ colony }: Props) => {
  const {
    colonyAddress,
    colonyName,
    description,
    displayName,
    guideline,
    website,
    tokens = {},
  } = colony;
  const transform = useCallback(
    pipe(
      withKey(colonyAddress),
      mergePayload({ colonyAddress }),
    ),
    [colonyAddress],
  );

  const tokenValues = Object.values(tokens);

  // $FlowFixMe
  const nativeTokenAddress: Address = tokenValues.find(token => token.isNative)
    .address;

  return (
    <div className={styles.main}>
      <main className={styles.content}>
        <ActionForm
          submit={ACTIONS.COLONY_PROFILE_UPDATE}
          success={ACTIONS.COLONY_PROFILE_UPDATE_SUCCESS}
          error={ACTIONS.COLONY_PROFILE_UPDATE_ERROR}
          transform={transform}
          initialValues={{
            colonyName,
            description,
            displayName,
            guideline,
            website,
          }}
          validationSchema={UpdateColonyProfileCommandArgsSchema}
        >
          {({ status, isSubmitting }) => (
            <Fragment>
              <FieldSet className={styles.section}>
                <InputLabel label={MSG.labelAddress} help={MSG.sendTokens} />
                <CopyableAddress appearance={{ theme: 'big' }} full>
                  {colonyAddress}
                </CopyableAddress>
              </FieldSet>
              <div className={styles.sectionENSName}>
                <InputLabel label={MSG.labelEnsName} />
                <Heading
                  appearance={{
                    margin: 'none',
                    size: 'medium',
                    weight: 'thin',
                  }}
                  /*
                   * @NOTE For the next improvement, we'll need to strip out the ENS subdomain part,
                   * and just truncate the actual name, so it'll look something like this:
                   * aaaaaaaaaaaaaaaa... .colony.joincolony.eth
                   */
                  text={ENS.getFullDomain('colony', colonyName)}
                />
              </div>
              {nativeTokenAddress && (
                <div className={styles.section}>
                  <InputLabel label={MSG.labelTokenAddress} />
                  <CopyableAddress appearance={{ theme: 'big' }} full>
                    {nativeTokenAddress}
                  </CopyableAddress>
                </div>
              )}
              <div className={styles.divider} />
              <FieldSet className={styles.inputSection}>
                <Input
                  appearance={{ theme: 'fat' }}
                  label={MSG.labelDisplayName}
                  name="displayName"
                />
              </FieldSet>
              <FieldSet className={styles.inputSection}>
                <Textarea
                  appearance={{ theme: 'fat', resizable: 'vertical' }}
                  style={{ minHeight: styles.textareaHeight }}
                  label={MSG.labelAbout}
                  name="description"
                  maxLength={160}
                />
              </FieldSet>
              <FieldSet className={styles.inputSection}>
                <Input
                  appearance={{ theme: 'fat' }}
                  label={MSG.labelWebsite}
                  name="website"
                />
              </FieldSet>
              <FieldSet className={styles.inputSection}>
                <Input
                  appearance={{ theme: 'fat' }}
                  label={MSG.labelGuidelines}
                  name="guideline"
                />
              </FieldSet>
              <FieldSet>
                <Button
                  appearance={{ theme: 'primary', size: 'large' }}
                  style={{ width: styles.wideButton }}
                  text={{ id: 'button.save' }}
                  type="submit"
                  loading={isSubmitting}
                />
              </FieldSet>
              <FormStatus status={status} />
            </Fragment>
          )}
        </ActionForm>
      </main>
      <aside className={styles.sidebar}>
        <ColonyAvatarUploader colony={colony} />
      </aside>
    </div>
  );
};

ProfileEdit.displayName = componentDisplayName;

export default ProfileEdit;
