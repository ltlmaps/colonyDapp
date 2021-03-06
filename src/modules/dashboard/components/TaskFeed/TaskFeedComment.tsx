import React from 'react';

import { PreserveLinebreaks } from '~utils/components';
import ExternalLink from '~core/ExternalLink';
import TimeRelative from '~core/TimeRelative';
import UserMention from '~core/UserMention';
import HookedUserAvatar from '~users/HookedUserAvatar';
import { useLoggedInUser, useUser, Event, TaskMessageEvent } from '~data/index';
import { Address } from '~types/index';

import TextDecorator from '../../../../lib/TextDecorator';
import { getFriendlyName } from '../../../users/transformers';

import styles from './TaskFeedComment.css';

const UserAvatar = HookedUserAvatar();

const displayName = 'dashboard.TaskFeed.TaskFeedComment';

interface Props {
  colonyAddress: Address;
  createdAt: Event['createdAt'];
  initiatorAddress: Event['initiatorAddress'];
  message: TaskMessageEvent['message'];
}

const TaskFeedComment = ({
  colonyAddress,
  createdAt,
  initiatorAddress,
  message,
}: Props) => {
  const { Decorate } = new TextDecorator({
    email: (text, normalized) => <ExternalLink text={text} href={normalized} />,
    link: (text, normalized) => <ExternalLink text={text} href={normalized} />,
    username: (text) => (
      <UserMention username={text.slice(1)} to={`/user/${text.slice(1)}`} />
    ),
  });

  const { walletAddress } = useLoggedInUser();

  const isCurrentUser = initiatorAddress === walletAddress;
  const author = useUser(initiatorAddress);
  const userDisplayName = getFriendlyName(author);
  return (
    <div
      className={`${styles.comment} ${
        isCurrentUser ? styles.commentSelf : styles.commentOther
      }`}
    >
      {!isCurrentUser && (
        <div className={styles.commentAvatar}>
          <UserAvatar
            address={initiatorAddress}
            colonyAddress={colonyAddress}
            showInfo
            size="s"
            notSet={false}
          />
        </div>
      )}
      <div className={styles.commentMain}>
        {!isCurrentUser && author && (
          <div className={styles.commentUsername}>
            <span>{userDisplayName}</span>
          </div>
        )}
        <div title={message} className={styles.commentBody}>
          <Decorate tagName={PreserveLinebreaks}>{message}</Decorate>
        </div>
        <div className={styles.commentTimestamp}>
          <TimeRelative value={createdAt} />
        </div>
      </div>
    </div>
  );
};

TaskFeedComment.displayName = displayName;

export default TaskFeedComment;
