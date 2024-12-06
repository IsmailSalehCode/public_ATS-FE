import Api from "./Api";

const rootRoute = `/attendance-entries`;

export default {
  add(kioskId, entity) {
    const qparamKioskId = `kiosk_id=${kioskId}`;
    return Api().post(`${rootRoute}?${qparamKioskId}`, entity);
  },
  getAllATEs(startDt, endDt) {
    return Api().get(`${rootRoute}/${startDt}/${endDt}`);
  },
  delete(id) {
    return Api().delete(`${rootRoute}/${id}`);
  },

  edit(entity) {
    return Api().patch(`${rootRoute}/${entity.id}`, entity);
  },
  getEachEmployeesATEs(startDt, endDt) {
    return Api().get(`${rootRoute}/employees/${startDt}/${endDt}`);
  },
};
