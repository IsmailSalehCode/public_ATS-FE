import Api from "./Api";

const rootRoute = `/nfc-tags`;

export default {
  add(tagId) {
    return Api().post(`${rootRoute}`, {
      tag_id: tagId,
    });
  },
  getAllUnassigned() {
    return Api().get(`${rootRoute}/unassigned`);
  },
  getAllAssigned() {
    return Api().get(`${rootRoute}/assigned`);
  },
  deleteOneTag(tagId) {
    return Api().delete(`${rootRoute}/${tagId}`);
  },
  assignTagToEmployee(tagId, employeeId) {
    return Api().patch(
      `${rootRoute}/assign-tag-to-employee/${tagId}/${employeeId}`
    );
  },
};
