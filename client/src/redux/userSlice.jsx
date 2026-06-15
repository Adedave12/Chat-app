import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  name: "",
  email: "",
  profile_pic: "",
  token: "",
  onlineUser: [],
  archivedUsers: [],
  blockedUsers: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state._id = action.payload._id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.profile_pic = action.payload.profile_pic;
      state.archivedUsers = action.payload.archivedUsers || [];
      state.blockedUsers = action.payload.blockedUsers || [];
    },

    setToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state._id = "";
      state.name = "";
      state.email = "";
      state.profile_pic = "";
      state.token = "";
      state.archivedUsers = [];
      state.blockedUsers = [];
      state.socketConnection = null;
      sessionStorage.removeItem("token");
    },
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload;
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload;
    },
    toggleArchivedUser: (state, action) => {
      const targetId = action.payload;
      if (state.archivedUsers.includes(targetId)) {
        state.archivedUsers = state.archivedUsers.filter(id => id !== targetId);
      } else {
        state.archivedUsers.push(targetId);
      }
    },
    toggleBlockedUser: (state, action) => {
      const targetId = action.payload;
      if (state.blockedUsers.includes(targetId)) {
        state.blockedUsers = state.blockedUsers.filter(id => id !== targetId);
      } else {
        state.blockedUsers.push(targetId);
      }
    }
  },
});

export const { setUser, setToken, logout, setOnlineUser, setSocketConnection, toggleArchivedUser, toggleBlockedUser } =
  userSlice.actions;

export default userSlice.reducer;
