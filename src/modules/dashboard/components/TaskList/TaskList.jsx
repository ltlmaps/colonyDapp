/* @flow */

import type { Node } from 'react';

// $FlowFixMe until hooks flow types
import React, { useMemo, useCallback } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import type { Address } from '~types';
import type { DomainId, TaskDraftId, TaskType } from '~immutable';

import { TASK_STATE } from '~immutable';
import { useDataTupleSubscriber } from '~utils/hooks';
import { TASKS_FILTER_OPTIONS } from '../shared/tasksFilter';
import { tasksByIdSubscriber } from '../../subscribers';

import { Table, TableBody, TableCell, TableRow } from '~core/Table';
import TaskListItem from './TaskListItem.jsx';

import taskListItemStyles from './TaskListItem.css';

const MSG = defineMessages({
  noTasks: {
    id: 'dashboard.TaskList.noTasks',
    defaultMessage: 'There are no tasks here.',
  },
});

type Props = {|
  draftIds: [Address, TaskDraftId][],
  emptyState?: Node,
  filteredDomainId?: DomainId,
  filterOption: string,
  walletAddress: Address,
|};

const TaskList = ({
  draftIds = [],
  emptyState,
  filteredDomainId,
  filterOption,
  walletAddress,
}: Props) => {
  const tasksData = useDataTupleSubscriber<TaskType>(
    tasksByIdSubscriber,
    draftIds,
  );
  const filter = useCallback(
    ({ creatorAddress, workerAddress, currentState, domainId }: TaskType) => {
      if (filteredDomainId && filteredDomainId !== domainId) return false;

      switch (filterOption) {
        case TASKS_FILTER_OPTIONS.CREATED:
          return creatorAddress === walletAddress;

        case TASKS_FILTER_OPTIONS.ASSIGNED:
          return workerAddress === walletAddress;

        case TASKS_FILTER_OPTIONS.COMPLETED:
          return currentState === TASK_STATE.FINALIZED;

        case TASKS_FILTER_OPTIONS.DISCARDED:
          return currentState === TASK_STATE.CANCELLED;

        case TASKS_FILTER_OPTIONS.ALL_OPEN:
          return currentState === TASK_STATE.ACTIVE;

        default:
          return currentState !== TASK_STATE.CANCELLED;
      }
    },
    [filterOption, walletAddress, filteredDomainId],
  );

  const filteredTasksData = useMemo(
    () =>
      filter
        ? tasksData.filter(({ data }) => (data ? filter(data) : true))
        : tasksData,
    [tasksData, filter],
  );

  return (
    <>
      <Table data-test="dashboardTaskList" scrollable>
        <TableBody>
          {filteredTasksData.map(taskData => (
            <TaskListItem key={taskData.key} data={taskData} />
          ))}
          {filteredTasksData.length === 0 && (
            <TableRow>
              <TableCell className={taskListItemStyles.empty}>
                {emptyState || (
                  <p>
                    <FormattedMessage {...MSG.noTasks} />
                  </p>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default TaskList;
