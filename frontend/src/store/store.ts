import { configureStore } from '@reduxjs/toolkit'
import themeReducer from "./reducers/theme.reducer";
import { storeApiConfig } from './api-config';
import authReducer from "./reducers/auth.reducer"
import { authApi } from './services/api.auth';

export const store = configureStore({
  reducer: {
    [storeApiConfig.reducerPath]: storeApiConfig.reducer,
    theme: themeReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storeApiConfig.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch


async function initializeApp() {
  // await store.dispatch(
  //   authApi.endpoints.refresh.initiate({}, { forceRefetch: true })
  // );
  await store.dispatch(
    authApi.endpoints.getMe.initiate({}, { forceRefetch: true })
  );
}

initializeApp();