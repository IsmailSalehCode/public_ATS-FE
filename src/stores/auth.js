import { defineStore } from "pinia";

const emptyToken = {
  content: null,
  issuedAt: null,
  expiresAt: null,
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: { ...emptyToken },
    user: null,
  }),
  getters: {
    hasToken: (state) => {
      return state.token.content != null;
    },
  },
  actions: {
    setUser(newUser) {
      this.user = newUser;
    },
    setToken(newToken) {
      this.token = newToken;
    },
    logOut() {
      // Reset the store state to its initial values
      this.$reset();
      // Clear the local storage entry for the store
      window.localStorage.removeItem(this.$id);
      // Verify state reset and localStorage removal
      // console.log("State after logout:", this.$state);
      // console.log(
      //   "LocalStorage after logout:",
      //   window.localStorage.getItem(this.$id)
      // );
    },
  },
});
