import { createApp } from "vue";
import { createHead } from "@unhead/vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import { VueRecaptchaPlugin } from "vue-recaptcha";

const captchaSiteKey = import.meta.env.VITE_CAPTCHA_KEY;

const pinia = createPinia();
pinia.use((context) => {
  const storeId = context.store.$id;

  const serializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };

  //sync store from localstorage
  const fromStorage =
    serializer.deserialize(window.localStorage.getItem(storeId)) || {};

  if (fromStorage) {
    context.store.$patch(fromStorage);
    // console.log(`Restored store ${storeId} from localStorage`, fromStorage);
  }

  //listen for changes and update localstorage
  context.store.$subscribe((mutation, state) => {
    // window.localStorage.setItem(storeId,state); we cannot save state as an object. We have to parse/stringify
    window.localStorage.setItem(storeId, serializer.serialize(state));
    // console.log(`Updated store ${storeId} in localStorage`, state);
  });
});
const app = createApp(App);
const head = createHead();
app.use(head);
app.use(vuetify);
app.use(pinia);
app.use(router);
app.use(VueRecaptchaPlugin, {
  v2SiteKey: captchaSiteKey,
});
app.mount("#app");
