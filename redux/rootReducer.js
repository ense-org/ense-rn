import { combineReducers } from 'redux-starter-kit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { reducer as auth } from './ducks/auth';

const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth,
});

export default persistReducer(rootPersistConfig, rootReducer);
