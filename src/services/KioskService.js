import Api from "./Api";

const rootRoute = `/ats-kiosks`;

export default {
  add(entity) {
    return Api().post(`${rootRoute}`, entity);
  },
  getAll() {
    return Api().get(rootRoute);
  },

  delete(id) {
    return Api().delete(`${rootRoute}/?kiosk_id=${id}`);
  },

  edit(entity) {
    return Api().patch(`${rootRoute}/?kiosk_id=${entity.id}`, entity);
  },
};
