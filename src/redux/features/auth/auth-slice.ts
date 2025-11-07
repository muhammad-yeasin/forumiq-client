import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Role = "admin" | "user";
export type User = {
  role: Role;
  username: string | null;
  avatar: string | null;
  _id: string | null;
  email: string | null;
};

type State = {
  user: User;
  accessToken: string | null;
  status: "authenticated" | "loading" | "unauthenticated";
};

const initialUser = {
  role: "user" as Role,
  username: null,
  avatar: null,
  _id: null,
  email: null,
};
const initialState: State = {
  user: initialUser,
  accessToken: null,
  status: "loading",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<State>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = action.payload.status;
    },
    logout: (state) => {
      state.user = initialUser;
      state.accessToken = null;
      state.status = "unauthenticated";
    },
  },
});

export default authSlice.reducer;
export const { login, logout } = authSlice.actions;
