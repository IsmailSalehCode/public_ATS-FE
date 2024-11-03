<template>
  <br />
  <div class="text-center">
    <h1>Logging you out...</h1>
  </div>
</template>

<script>
import { useAuthStore } from "../stores/auth";
export default {
  mounted() {
    const store = useAuthStore();
    //test if after logging in and out for a second time, shit will work
    store.logOut();
    this.$router.push("/").catch(() => {});
  },
};
</script>
