export default {
  methods: {
    timestampToLocale(dt) {
      return new Date(dt).toLocaleString("bg", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
  },
};