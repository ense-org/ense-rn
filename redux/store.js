import { configureStore as createStore } from 'redux-starter-kit';
import { persistStore } from 'redux-persist';

import rootReducer from './rootReducer';

const store = createStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

const persistor = persistStore(store);

export const configureStore = () => ({ store, persistor });
