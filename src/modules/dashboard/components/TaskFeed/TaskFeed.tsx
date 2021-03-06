import React, { Fragment, useRef, useLayoutEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import { SpinnerLoader } from '~core/Preloaders';
import {
  useTaskFeedEventsQuery,
  EventType,
  TaskMessageEvent,
  AnyTask,
} from '~data/index';
import { Address } from '~types/index';

import TaskFeedEvent from './TaskFeedEvent';
import TaskFeedComment from './TaskFeedComment';
import TaskFeedCompleteInfo from './TaskFeedCompleteInfo';
import styles from './TaskFeed.css';

const displayName = 'dashboard.TaskFeed';

interface Props {
  colonyAddress: Address;
  draftId: AnyTask['id'];
}

const MSG = defineMessages({
  feedLoadingText: {
    id: 'dashboard.TaskFeed.feedLoadingText',
    defaultMessage: 'Loading Task Events...',
  },
});

const TaskFeed = ({ colonyAddress, draftId }: Props) => {
  const bottomEl = useRef(null);

  const scrollToEnd = () => {
    if (bottomEl.current) {
      (bottomEl.current as any).scrollIntoView(false);
    }
  };

  useLayoutEffect(() => {
    // Content is not fully loaded at first, wait a moment
    setTimeout(scrollToEnd, 0);
  }, [bottomEl]);

  const { data } = useTaskFeedEventsQuery({
    // @todo use subscription for `TaskFeedEvents` instead of `pollInterval` (once supported by server)
    pollInterval: 5000,
    variables: { id: draftId },
  });

  useLayoutEffect(scrollToEnd, [data]);

  if (!data) {
    return <SpinnerLoader />;
  }

  const {
    task: { events, finalizedAt, finalizedPayment, payouts },
  } = data;

  return (
    <>
      {events && (
        <div className={styles.main}>
          <div className={styles.items}>
            {
              /*
               * There is always at least one task event: TASK_CREATED
               */
              events.length < 1 ? (
                <div className={styles.eventsLoader}>
                  <SpinnerLoader appearance={{ size: 'small' }} />
                  <span className={styles.eventsLoaderText}>
                    <FormattedMessage {...MSG.feedLoadingText} />
                  </span>
                </div>
              ) : (
                <div>
                  {events.map((event) => {
                    const {
                      context,
                      createdAt,
                      initiatorAddress,
                      sourceId,
                    } = event;
                    if (context.type === EventType.TaskMessage) {
                      const { message } = context as TaskMessageEvent;
                      return (
                        <TaskFeedComment
                          colonyAddress={colonyAddress}
                          createdAt={createdAt}
                          initiatorAddress={initiatorAddress}
                          key={sourceId}
                          message={message}
                        />
                      );
                    }

                    if (
                      context.type === EventType.FinalizeTask &&
                      finalizedAt &&
                      finalizedPayment
                    ) {
                      return (
                        <Fragment key={sourceId}>
                          <TaskFeedCompleteInfo
                            colonyAddress={colonyAddress}
                            payouts={payouts}
                            finalizedAt={finalizedAt}
                            finalizedPayment={finalizedPayment}
                          />
                          <TaskFeedEvent
                            colonyAddress={colonyAddress}
                            event={event}
                          />
                        </Fragment>
                      );
                    }

                    // /**
                    //  * @todo Check that the reveal period is over for ratings
                    //  * (task feed).
                    //  */
                    // if (rating) {
                    //   return <TaskFeedRating key={sourceId} rating={rating} />;
                    // }

                    return (
                      <TaskFeedEvent
                        colonyAddress={colonyAddress}
                        event={event}
                        key={sourceId}
                      />
                    );
                  })}
                  <div ref={bottomEl} />
                </div>
              )
            }
          </div>
        </div>
      )}
    </>
  );
};

TaskFeed.displayName = displayName;

export default TaskFeed;
