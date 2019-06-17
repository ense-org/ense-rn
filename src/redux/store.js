import { configureStore } from 'redux-starter-kit';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';

import rootReducer from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: [thunk],
});

/**
 * Shouldn't be used much, unless you're working to inject some part of the
 * state deep into some service object or something. Only exported as a global
 * because it can get a bit hairy with circular dependencies if we import the
 * root store into other files that have many dependencies. See, for ex. {@link utils/api}
 * where we use it to inject the Auth Header into requests.
 */
global.store = store;

export const persistor = persistStore(store);
