import {
  ColonyTasksDocument,
  ColonyTasksQuery,
  ColonyTasksQueryVariables,
  OneLevel,
  OneProgram,
  OneSuggestion,
  TaskDocument,
  TaskQuery,
  TaskQueryVariables,
} from '~data/index';
import { Address } from '~types/index';
import { log } from '~utils/debug';

import apolloCache from './cache';
import {
  AcceptLevelTaskSubmissionMutationResult,
  ColonyProgramsDocument,
  ColonyProgramsQuery,
  ColonyProgramsQueryVariables,
  ColonySubscribedUsersDocument,
  ColonySubscribedUsersQuery,
  ColonySubscribedUsersQueryVariables,
  ColonySuggestionsDocument,
  ColonySuggestionsQuery,
  ColonySuggestionsQueryVariables,
  CreateLevelMutationResult,
  CreateProgramMutationResult,
  CreateTaskFromSuggestionMutationResult,
  CreateTaskMutationResult,
  LevelDocument,
  LevelQuery,
  LevelQueryVariables,
  ProgramDocument,
  ProgramQuery,
  ProgramQueryVariables,
  ProgramSubmissionsDocument,
  ProgramSubmissionsQuery,
  ProgramSubmissionsQueryVariables,
  RemoveLevelTaskMutationResult,
  SetSuggestionStatusMutationResult,
  SuggestionStatus,
  UserDocument,
  UserQuery,
  UserQueryVariables,
  SubmissionStatus,
  RemoveLevelMutationResult,
} from './generated';

type Cache = typeof apolloCache;

const cacheUpdates = {
  acceptLevelTaskSubmission(programId: OneProgram['id']) {
    return (
      cache: Cache,
      { data }: AcceptLevelTaskSubmissionMutationResult,
    ) => {
      try {
        const cacheData = cache.readQuery<
          ProgramSubmissionsQuery,
          ProgramSubmissionsQueryVariables
        >({
          query: ProgramSubmissionsDocument,
          variables: { id: programId },
        });
        const acceptSubmissionData = data && data.acceptLevelTaskSubmission;
        if (cacheData && acceptSubmissionData) {
          const isAccepted =
            acceptSubmissionData.status === SubmissionStatus.Accepted;
          const submissions = isAccepted
            ? cacheData.program.submissions.filter(
                ({ id }) => id !== acceptSubmissionData.id,
              )
            : cacheData.program.submissions;
          cache.writeQuery<
            ProgramSubmissionsQuery,
            ProgramSubmissionsQueryVariables
          >({
            data: {
              program: {
                ...cacheData.program,
                submissions,
              },
            },
            query: ProgramSubmissionsDocument,
            variables: { id: programId },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose(
          'Not updating store - level step submissions not loaded yet',
        );
      }
    };
  },
  createLevel(programId: OneProgram['id']) {
    return (cache: Cache, { data }: CreateLevelMutationResult) => {
      try {
        const cacheData = cache.readQuery<ProgramQuery, ProgramQueryVariables>({
          query: ProgramDocument,
          variables: {
            id: programId,
          },
        });
        const createLevelData = data && data.createLevel;
        if (cacheData && createLevelData) {
          const levels = cacheData.program.levels || [];
          levels.push(createLevelData);
          const levelIds = cacheData.program.levelIds || [];
          levelIds.push(createLevelData.id);
          cache.writeQuery<ProgramQuery, ProgramQueryVariables>({
            data: {
              program: {
                ...cacheData.program,
                levelIds,
                levels,
              },
            },
            query: ProgramDocument,
            variables: {
              id: programId,
            },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose('Not updating store - colony programs not loaded yet');
      }
    };
  },
  removeLevel(programId: OneProgram['id']) {
    return (cache: Cache, { data }: RemoveLevelMutationResult) => {
      try {
        const cacheData = cache.readQuery<ProgramQuery, ProgramQueryVariables>({
          query: ProgramDocument,
          variables: {
            id: programId,
          },
        });
        const removeLevelData = data && data.removeLevel;
        if (cacheData && removeLevelData) {
          const { id: removedId } = removeLevelData;
          const levels = cacheData.program.levels.filter(
            ({ id }) => id !== removedId,
          );
          const levelIds = cacheData.program.levelIds.filter(
            (id) => id !== removedId,
          );
          cache.writeQuery<ProgramQuery, ProgramQueryVariables>({
            data: {
              program: {
                ...cacheData.program,
                levelIds,
                levels,
              },
            },
            query: ProgramDocument,
            variables: {
              id: programId,
            },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose('Not updating store - program levels not loaded yet');
      }
    };
  },
  removeLevelTask(levelId: OneLevel['id']) {
    return (cache: Cache, { data }: RemoveLevelTaskMutationResult) => {
      try {
        const cacheData = cache.readQuery<LevelQuery, LevelQueryVariables>({
          query: LevelDocument,
          variables: { id: levelId },
        });
        const removedLevelTaskData = data && data.removeLevelTask;
        if (cacheData && removedLevelTaskData) {
          const steps = cacheData.level.steps.filter(
            ({ id }) => id !== removedLevelTaskData.id,
          );
          const stepIds = cacheData.level.stepIds.filter(
            (id) => id !== removedLevelTaskData.id,
          );
          let { numRequiredSteps } = cacheData.level;
          if (
            typeof numRequiredSteps === 'number' &&
            numRequiredSteps > stepIds.length
          ) {
            numRequiredSteps = stepIds.length;
          }
          cache.writeQuery<LevelQuery, LevelQueryVariables>({
            data: {
              level: {
                ...cacheData.level,
                numRequiredSteps,
                stepIds,
                steps,
              },
            },
            query: LevelDocument,
            variables: { id: levelId },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose('Not updating store - level tasks not loaded yet');
      }
    };
  },
  createProgram(colonyAddress: Address) {
    return (cache: Cache, { data }: CreateProgramMutationResult) => {
      try {
        const cacheData = cache.readQuery<
          ColonyProgramsQuery,
          ColonyProgramsQueryVariables
        >({
          query: ColonyProgramsDocument,
          variables: {
            address: colonyAddress,
          },
        });
        const createProgramData = data && data.createProgram;
        if (cacheData && createProgramData) {
          const programs = cacheData.colony.programs || [];
          programs.push(createProgramData);
          cache.writeQuery<ColonyProgramsQuery, ColonyProgramsQueryVariables>({
            data: {
              colony: {
                ...cacheData.colony,
                programs,
              },
            },
            query: ColonyProgramsDocument,
            variables: {
              address: colonyAddress,
            },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose('Not updating store - colony programs not loaded yet');
      }
    };
  },
  createTask(colonyAddress: Address) {
    return (cache: Cache, { data }: CreateTaskMutationResult) => {
      try {
        const cacheData = cache.readQuery<
          ColonyTasksQuery,
          ColonyTasksQueryVariables
        >({
          query: ColonyTasksDocument,
          variables: {
            address: colonyAddress,
          },
        });
        const createTaskData = data && data.createTask;
        if (cacheData && createTaskData) {
          const tasks = cacheData.colony.tasks || [];
          tasks.push(createTaskData);
          cache.writeQuery<ColonyTasksQuery, ColonyTasksQueryVariables>({
            query: ColonyTasksDocument,
            data: {
              colony: {
                ...cacheData.colony,
                tasks,
              },
            },
            variables: {
              address: colonyAddress,
            },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose('Not updating store - colony tasks not loaded yet');
      }
    };
  },
  createTaskFromSuggestion(
    colonyAddress: Address,
    suggestionId: OneSuggestion['id'],
  ) {
    return (cache: Cache, { data }: CreateTaskFromSuggestionMutationResult) => {
      try {
        const cacheData = cache.readQuery<
          ColonySuggestionsQuery,
          ColonySuggestionsQueryVariables
        >({
          query: ColonySuggestionsDocument,
          variables: {
            colonyAddress,
          },
        });
        if (cacheData) {
          const suggestions = cacheData.colony.suggestions.map((suggestion) =>
            suggestion.id === suggestionId
              ? { ...suggestion, status: SuggestionStatus.Accepted } // update status of changed suggestion
              : suggestion,
          );
          cache.writeQuery<
            ColonySuggestionsQuery,
            ColonySuggestionsQueryVariables
          >({
            query: ColonySuggestionsDocument,
            data: {
              colony: {
                ...cacheData.colony,
                suggestions,
              },
            },
            variables: {
              colonyAddress,
            },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose('Not updating store - suggestions not loaded yet');
      }
      try {
        const cacheData = cache.readQuery<
          ColonyTasksQuery,
          ColonyTasksQueryVariables
        >({
          query: ColonyTasksDocument,
          variables: {
            address: colonyAddress,
          },
        });
        const createTaskData = data && data.createTaskFromSuggestion;
        if (cacheData && createTaskData) {
          const tasks = cacheData.colony.tasks || [];
          tasks.push(createTaskData);
          cache.writeQuery<ColonyTasksQuery, ColonyTasksQueryVariables>({
            query: ColonyTasksDocument,
            data: {
              colony: {
                ...cacheData.colony,
                tasks,
              },
            },
            variables: {
              address: colonyAddress,
            },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose('Not updating store - colony tasks not loaded yet');
      }
    };
  },
  setSuggestionStatus(colonyAddress: Address) {
    return (cache: Cache, { data }: SetSuggestionStatusMutationResult) => {
      try {
        const cacheData = cache.readQuery<
          ColonySuggestionsQuery,
          ColonySuggestionsQueryVariables
        >({
          query: ColonySuggestionsDocument,
          variables: {
            colonyAddress,
          },
        });
        if (cacheData && data && data.setSuggestionStatus) {
          const { id: suggestionId, status } = data.setSuggestionStatus;
          const suggestions =
            status === SuggestionStatus.Deleted
              ? cacheData.colony.suggestions.filter(
                  // remove suggestion from cache
                  ({ id }) => id !== suggestionId,
                )
              : cacheData.colony.suggestions.map((suggestion) =>
                  suggestion.id === suggestionId // update status of changed suggestion
                    ? { ...suggestion, status }
                    : suggestion,
                );
          cache.writeQuery<
            ColonySuggestionsQuery,
            ColonySuggestionsQueryVariables
          >({
            query: ColonySuggestionsDocument,
            data: {
              colony: {
                ...cacheData.colony,
                suggestions,
              },
            },
            variables: {
              colonyAddress,
            },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose('Not updating store - suggestions not loaded yet');
      }
    };
  },
  unsubscribeFromColony(colonyAddress: Address) {
    return (cache: Cache, { data }: any) => {
      try {
        const cacheData = cache.readQuery<
          ColonySubscribedUsersQuery,
          ColonySubscribedUsersQueryVariables
        >({
          query: ColonySubscribedUsersDocument,
          variables: {
            colonyAddress,
          },
        });
        if (cacheData && data && data.unsubscribeFromColony) {
          const {
            id: unsubscribedUserWalletAddress,
          } = data.unsubscribeFromColony;
          const { subscribedUsers } = cacheData.colony;
          const updatedColonySubscription = subscribedUsers.filter(
            ({ id: userWalletAddress }) =>
              /*
               * Remove the unsubscribed user from the subscribers array
               */
              userWalletAddress !== unsubscribedUserWalletAddress,
          );
          cache.writeQuery<
            ColonySubscribedUsersQuery,
            ColonySubscribedUsersQueryVariables
          >({
            query: ColonySubscribedUsersDocument,
            data: {
              colony: {
                ...cacheData.colony,
                subscribedUsers: updatedColonySubscription,
              },
            },
            variables: {
              colonyAddress,
            },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose(
          'Cannot update the colony subscriptions cache - not loaded yet',
        );
      }
    };
  },
  subscribeToColony(colonyAddress: Address) {
    return (cache: Cache, { data }: any) => {
      try {
        const cacheData = cache.readQuery<
          ColonySubscribedUsersQuery,
          ColonySubscribedUsersQueryVariables
        >({
          query: ColonySubscribedUsersDocument,
          variables: {
            colonyAddress,
          },
        });
        if (cacheData && data && data.subscribeToColony) {
          const { id: subscribedUserWalletAddress } = data.subscribeToColony;
          const { subscribedUsers } = cacheData.colony;
          /*
           * The subscribed to colony mutation, only returns the user wallet address,
           * but we also need the user's profile to update the subscribers array
           */
          const subscribedUserProfileFromCache = cache.readQuery<
            UserQuery,
            UserQueryVariables
          >({
            query: UserDocument,
            variables: {
              address: subscribedUserWalletAddress,
            },
          });
          if (
            subscribedUserProfileFromCache &&
            subscribedUserProfileFromCache.user
          ) {
            const {
              user: { profile: subscribedUserProfile },
            } = subscribedUserProfileFromCache;
            const updatedColonySubscription = [...subscribedUsers];
            /*
             * Add the subscribed user to the subscribers array
             */
            updatedColonySubscription.push({
              ...data.subscribeToColony,
              profile: subscribedUserProfile,
            });
            cache.writeQuery<
              ColonySubscribedUsersQuery,
              ColonySubscribedUsersQueryVariables
            >({
              query: ColonySubscribedUsersDocument,
              data: {
                colony: {
                  ...cacheData.colony,
                  subscribedUsers: updatedColonySubscription,
                },
              },
              variables: {
                colonyAddress,
              },
            });
          }
        }
      } catch (e) {
        log.verbose(e);
        log.verbose(
          'Cannot update the colony subscriptions cache - not loaded yet',
        );
      }
    };
  },
  setTaskSkill(draftId: string) {
    return (cache: Cache, { data }: any) => {
      try {
        const cacheData = cache.readQuery<TaskQuery, TaskQueryVariables>({
          query: TaskDocument,
          variables: {
            id: draftId,
          },
        });
        const taskData = data && data.setTaskSkill;
        if (cacheData && taskData) {
          cache.writeQuery<TaskQuery, TaskQueryVariables>({
            query: TaskDocument,
            data: {
              task: {
                ...cacheData.task,
                ethSkillId: taskData.ethSkillId,
              },
            },
            variables: {
              id: draftId,
            },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose('Not updating store - task not loaded yet');
      }
    };
  },
  removeTaskSkill(draftId: string) {
    return (cache: Cache) => {
      try {
        const cacheData = cache.readQuery<TaskQuery, TaskQueryVariables>({
          query: TaskDocument,
          variables: {
            id: draftId,
          },
        });
        if (cacheData) {
          cache.writeQuery<TaskQuery, TaskQueryVariables>({
            query: TaskDocument,
            data: {
              task: {
                ...cacheData.task,
                ethSkillId: null,
              },
            },
            variables: {
              id: draftId,
            },
          });
        }
      } catch (e) {
        log.verbose(e);
        log.verbose('Not updating store - task not loaded yet');
      }
    };
  },
};

export default cacheUpdates;
