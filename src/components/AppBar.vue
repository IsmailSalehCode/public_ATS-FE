<template>
  <v-app-bar id="appBar" variant="flat" density="compact">
    <v-app-bar-title>
      <v-btn
        size="small"
        variant="outlined"
        color="white"
        @click="routeToHome"
        rounded
      >
        BSI Ltd.&nbsp;<v-icon :icon="iconOfficeBuilding" right></v-icon>
      </v-btn>
    </v-app-bar-title>
    <template v-slot:append>
      <v-col class="hidden-xs" v-for="item in menuItems" :key="item.path">
        <v-btn :active="false" style="font-size: small" :to="item.path">{{
          item.title
        }}</v-btn>
      </v-col>
      <v-app-bar-nav-icon
        class="d-flex d-sm-none"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
    </template>
  </v-app-bar>
  <v-navigation-drawer
    app
    color="rgb(14, 14, 14)"
    v-model="drawer"
    theme="dark"
    location="right"
    temporary
  >
    <v-list theme="dark" nav>
      <v-list-item
        style="text-align: center"
        v-for="item in menuItems"
        :key="item.id"
        :to="item.path"
        :active="false"
      >
        <v-list-item-title style="font-size: medium">{{
          item.title
        }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mdiOfficeBuilding } from "@mdi/js";
import { useAuthStore } from "../stores/auth";

export default {
  computed: {
    menuItems() {
      let menuItems = null;
      const authStore = useAuthStore();
      const defaultMenuItems = [];
      const unAuthenticatedMenuItems = [
        {
          path: "/login",
          title: "Log In",
        },
      ];
      const authenticatedMenuItems = [
        { title: "Dashboard", path: "/" },
        { title: "Log Out", path: "/logout" },
      ];
      menuItems = defaultMenuItems;
      const isLoggedIn = authStore.hasToken;

      if (isLoggedIn) {
        menuItems = menuItems.concat(authenticatedMenuItems);
      } else {
        menuItems = menuItems.concat(unAuthenticatedMenuItems);
      }
      return menuItems;
    },
  },
  data() {
    return {
      drawer: false,
      iconOfficeBuilding: mdiOfficeBuilding,
    };
  },
  methods: {
    routeToHome() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
#blackBgColor24 {
  background-color: rgb(24, 24, 24);
}
#appBar {
  background-color: rgb(14, 14, 14);
  color: white;
}
a:-webkit-any-link {
  text-decoration: none;
  transition: all 0.3s;
}
a:-webkit-any-link:hover {
  color: rgb(27, 164, 250);
}
</style>
