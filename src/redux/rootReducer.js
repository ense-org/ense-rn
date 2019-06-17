import { combineReducers } from 'redux-starter-kit';
import { persistReducer } from 'redux-persist';
import type { Reducer, AnyAction } from 'redux';
import storage from 'redux-persist/lib/storage';
import type { State } from './types';
import { reducer as auth } from './ducks/auth';
import { reducer as feed } from './ducks/feed';
import { reducer as accounts } from './ducks/accounts';
import { reducer as audio } from './ducks/audio';
import { reducer as run } from './ducks/run';

const config = {
  key: 'root',
  storage,
  whitelist: ['auth', 'feed', 'accounts', 'audio'],
  blacklist: ['run'],
  version: -1,
};

/**
 * Almost all shared state across the app works through redux.
 * Most of the store is persisted in RN's AsyncStorage, backed
 * by basic platform async data persist stores. `run` is being used
 * here as a root for all state that does not need to be persisted
 * across app runs, but still needs to be shared across parts of each
 * app session (think recording state, or some ense caches).
 */
const rootReducer: Reducer<State, AnyAction> = combineReducers({
  auth,
  feed,
  accounts,
  audio,
  run,
});

export default persistReducer(config, rootReducer);
