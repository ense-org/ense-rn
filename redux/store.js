import { configureStore as createStore } from 'redux-starter-kit';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';

import rootReducer from './rootReducer';

const store = createStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: [thunk],
});
const persistor = persistStore(store);
export const configureStore = () => {
  return { store, persistor };
};
