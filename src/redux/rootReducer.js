import { combineReducers } from 'redux-starter-kit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { reducer as auth } from './ducks/auth';
import { reducer as feed } from './ducks/feed';
import { reducer as accounts } from './ducks/accounts';

const config = {
  key: 'root',
  storage,
  whitelist: ['auth', 'feed'],
  version: -1,
};

const rootReducer = combineReducers({
  auth,
  feed,
  accounts,
});

export default persistReducer(config, rootReducer);
