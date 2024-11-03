import axios from "axios";

// pinia is not yet initialized, so i have to use localStorage in order to retrieve the auth token. This shouldn't be a problem as there is a subscription in place (main.js)
function getTokenFromLocalStorage() {
  const authData = localStorage.getItem("auth");

  if (!authData) {
    // console.error("No auth data found! Try logging in again."); dont error log this. Otherwise users, who are not supposed to be authed, will see this.
    return null;
  }

  try {
    const authObj = JSON.parse(authData);
    return authObj.token.content;
  } catch (error) {
    console.error("Failed to parse auth data from localStorage:", error);
    return null;
  }
}

export default () => {
  const url = import.meta.env.VITE_BASE_URL;
  const localStorageToken = getTokenFromLocalStorage();
  return axios.create({
    baseURL: url || "http://localhost:8098/",
    headers: {
      Authorization: `Bearer ${localStorageToken}`,
    },
  });
};
