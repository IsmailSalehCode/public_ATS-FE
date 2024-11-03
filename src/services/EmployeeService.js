import Api from "./Api";

const rootRoute = `/employees`;

export default {
  add(entity) {
    return Api().post(`${rootRoute}`, entity);
  },
  getAll() {
    return Api().get(`${rootRoute}`);
  },

  delete(id) {
    return Api().delete(`${rootRoute}/${id}`);
  },

  unassignTagAndDeleteAssociatedATEs(id) {
    return Api().delete(`${rootRoute}/unassign-tag/${id}`);
  },

  edit(updatedEntity) {
    return Api().patch(`${rootRoute}/${updatedEntity.id}`, updatedEntity);
  },
};
