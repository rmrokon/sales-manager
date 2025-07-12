import { createSlice } from "@reduxjs/toolkit";

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthInitialState {
  user: IUser | null;
  roles: { id: string; name: string }[];
  permissions: { id: string; name: string }[];
  company: any;
  accessToken: string | null;
  initializing: boolean;
  isLoggedIn: boolean;
}

const initialState: AuthInitialState = {
  user: null,
  roles: [],
  permissions: [],
  company: null,
  accessToken: null,
  initializing: true,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser(state, action) {
      state.user = action.payload.user;
      state.roles = action.payload.roles;
      state.permissions = action.payload.permissions;
      state.company = action.payload.company;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.initializing = action.payload.initializing || false;
    },
    logout() {
      localStorage.removeItem('accessToken');
      return initialState;
    }
  },
});

export const { setAuthUser, logout } = authSlice.actions;

export default authSlice.reducer;

