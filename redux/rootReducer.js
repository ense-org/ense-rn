import { combineReducers } from 'redux-starter-kit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { reducer as auth } from './ducks/auth';

const config = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  version: -1,
};

const rootReducer = combineReducers({
  auth,
});

export default persistReducer(config, rootReducer);
