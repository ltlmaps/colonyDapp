import gql from 'graphql-tag';

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
    }
  }
`;

export const SET_TASK_DOMAIN = gql`
  mutation SetTaskDomain($input: SetTaskDomainInput!) {
    setTaskDomain(input: $input) {
      id
      ethDomainId
    }
  }
`;

export const SET_TASK_DESCRIPTION = gql`
  mutation SetTaskDescription($input: SetTaskDescriptionInput!) {
    setTaskDescription(input: $input) {
      id
      description
    }
  }
`;

export const SET_TASK_DUE_DATE = gql`
  mutation SetTaskDueDate($input: SetTaskDueDateInput!) {
    setTaskDueDate(input: $input) {
      id
      dueDate
    }
  }
`;

export const SET_TASK_PAYOUT = gql`
  mutation SetTaskPayout($input: SetTaskPayoutInput!) {
    setTaskPayout(input: $input) {
      id
      amount
      token
      ethDomainId
    }
  }
`;

export const SET_TASK_SKILL = gql`
  mutation SetTaskSkill($input: SetTaskSkillInput!) {
    setTaskSkill(input: $input) {
      id
      ethSkillId
    }
  }
`;

export const SET_TASK_TITLE = gql`
  mutation SetTaskTitle($input: SetTaskTitleInput!) {
    setTaskTitle(input: $input) {
      id
      title
    }
  }
`;

export const UNASSIGN_WORKER = gql`
  mutation UnassignWorker($input: UnassignWorkerInput!) {
    unassignWorker(input: $input) {
      id
      workerAddress
    }
  }
`;