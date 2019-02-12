/* @flow */

import type { $Pick } from '~types';

import type { ActionsType } from './actions';

/*
 * This type, when assigned to a reducer, ensures that the actions specified
 * exist in `ActionsType`, and that the action objects are fully typed.
 *
 * S: State for the reducer, e.g. ImmutableMapType<>
 *
 * T: Object of action types with passthrough values, e.g.
 * ReducerType<State, {| COLONY_CREATE: *, COLONY_CREATE_ERROR: * |}>
 */
export type ReducerType<S, T: { [actionType: $Keys<ActionsType>]: * }> = (
  state: S,
  action: $Values<$Pick<ActionsType, T>>,
) => S;
