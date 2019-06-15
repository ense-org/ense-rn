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

const rootReducer: Reducer<State, AnyAction> = combineReducers({
  auth,
  feed,
  accounts,
  audio,
  run,
});

export default persistReducer(config, rootReducer);
