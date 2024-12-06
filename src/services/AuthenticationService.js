import Api from "./Api";

export default {
  forgotPassword(token, email) {
    return Api().post(
      "/forgot-password",
      { email: email },
      {
        headers: {
          captcha: token,
        },
      }
    );
  },
  changePass(prt, newPass) {
    return Api().patch(`/change-password/${prt}`, {
      password: newPass,
    });
  },
  login(token, credentials) {
    return Api().post("/login", credentials, {
      headers: {
        captcha: token,
      },
    });
  },
};
