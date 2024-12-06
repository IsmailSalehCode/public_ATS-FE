import Api from "./Api";

const rootRoute = `/users`;

export default {
  addUser(user) {
    return Api().post(`${rootRoute}`, user);
  },
  getUsers() {
    return Api().get(`${rootRoute}`);
  },

  deleteUser(id) {
    return Api().delete(`${rootRoute}/${id}`);
  },

  editUser(user) {
    return Api().patch(`${rootRoute}/${user.id}`, user);
  },
  changePass(userId, newPass) {
    return Api().patch(`${rootRoute}/change-pass/${userId}`, {
      password: newPass,
    });
  },
};
