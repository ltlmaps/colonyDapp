/* @flow */

import type { Saga } from 'redux-saga';
import type { MessageDescriptor } from 'react-intl';

import { call, put, race, take, getContext } from 'redux-saga/effects';

import type { ENSName, TakeFilter } from '~types';

import { isDev, log } from '~utils/debug';

/*
 * Effect to create a new class instance of Class (use instead of "new Class")
 */
export const create = (Class: Function, ...args: any[]) =>
  call(() => new Class(...args));

/*
 * Effect to put a consistent error action
 */
export const putError = (
  type: string,
  error: Error,
  meta?: Object = {},
  msg?: MessageDescriptor | string,
) => {
  const action = {
    type,
    error: true,
    meta,
    payload: {
      error: msg || { id: `sagaError.${type}` },
    },
  };
  if (isDev) {
    log(error);
    Object.assign(action.meta, {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
  return put(action);
};

/**
 * Races the `take` of two actions, one success and one error. If success is
 * first, function returns. If error is first, function throws.
 */
export const raceError = (
  successAction: string | TakeFilter,
  errorAction: string | TakeFilter,
  error?: Error,
) => {
  function* raceErrorGenerator(): Saga<void> {
    const result = yield race([take(successAction), take(errorAction)]);
    if (result.type === errorAction) throw error || new Error(result.payload);
    return result;
  }
  return call(raceErrorGenerator);
};

/**
 * Gets the caller from the colonyManager and calls it with the given
 * parameters. If no colonyENSName, network context is assumed.
 */
export const callCaller = ({
  context,
  identifier,
  methodName,
  params = {},
}: {
  context: 'colony' | 'network',
  identifier?: ENSName,
  methodName: string,
  params?: Object,
}) => {
  function* callCallerGenerator(): Saga<Object> {
    const colonyManager = yield getContext('colonyManager');
    const caller = yield call(
      [colonyManager, colonyManager.getMethod],
      context,
      methodName,
      identifier,
    );
    return yield call([caller, caller.call], params);
  }
  return call(callCallerGenerator);
};
