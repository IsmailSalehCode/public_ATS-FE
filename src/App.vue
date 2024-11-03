<template>
  <v-app>
    <AppBar />
    <v-main>
      <router-view></router-view>
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script>
import AppBar from "./components/AppBar.vue";
import AppFooter from "./components/AppFooter.vue";
import { useRecaptchaProvider } from "vue-recaptcha";

export default {
  created() {
    useRecaptchaProvider();
  },
  components: {
    AppBar,
    AppFooter,
  },
};
</script>

<style>
.v-card-actions {
  flex-wrap: wrap;
}
.v-toolbar {
  background-color: lightgray;
}
html {
  overflow-y: auto;
  scroll-behavior: smooth;
}
.v-application {
  font-family: sans-serif, Times;
}
body {
  font-size: smaller;
  /* font-size: medium; */
  margin: 0;
  padding: 0;
}
p {
  text-indent: 10px;
  font-weight: 200;
  text-align: justify;
}
/* width */
::-webkit-scrollbar {
  width: 4px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #004e92;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #309fff;
}
.customLink {
  text-decoration: none;
  color: #2188c3;
  transition: all 0.3s;
}
.customLink:hover {
  color: #1dade7;
}
</style>
