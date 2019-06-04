import { configureStore, getDefaultMiddleware, combineReducers } from 'redux-starter-kit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const rootPersistConfig = {
  key: 'root',
  storage,
  blacklist: ['auth'],
};

const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['somethingTemporary'],
};

const rootReducer = combineReducers({
  // auth: persistReducer(authPersistConfig, authReducer),
  // other: otherReducer,
});

export default persistReducer(rootPersistConfig, rootReducer);
