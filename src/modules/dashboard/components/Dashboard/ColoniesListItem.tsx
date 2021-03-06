import React from 'react';

import Link from '~core/Link';
import { SpinnerLoader } from '~core/Preloaders';
import HookedColonyAvatar from '~dashboard/HookedColonyAvatar';
import { useColonyProfileQuery } from '~data/index';

import styles from './ColoniesListItem.css';

const ColonyAvatar = HookedColonyAvatar({ fetchColony: false });
interface Props {
  colonyAddress: string;
}

const ColoniesListItem = ({ colonyAddress }: Props) => {
  const { loading, data } = useColonyProfileQuery({
    variables: { address: colonyAddress },
  });

  if (loading || !data) {
    return (
      <div className={styles.main}>
        <SpinnerLoader appearance={{ size: 'medium' }} />
      </div>
    );
  }

  const {
    colony: { colonyName, displayName },
    colony,
  } = data;

  return (
    <div className={styles.main}>
      <Link to={`/colony/${colonyName}`} className={styles.linkAlignment}>
        <ColonyAvatar colonyAddress={colonyAddress} colony={colony} size="s" />
        <p title={displayName || colonyName} className={styles.displayName}>
          {displayName}
        </p>
      </Link>
    </div>
  );
};

export default ColoniesListItem;
