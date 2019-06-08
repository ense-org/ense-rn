import { configureStore } from 'redux-starter-kit';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';

import rootReducer from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: [thunk],
});

// Helps with circular dependencies to have this exported as a global
global.store = store;

export const persistor = persistStore(store);
