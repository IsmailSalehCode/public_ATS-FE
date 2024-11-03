<template>
  <v-footer theme="dark" absolute app bottom class="text-center">
    <v-col cols="12">
      &#169; {{ new Date().getFullYear() }} -
      <strong>Blue Sky Invest Ltd.</strong> All rights reserved.
    </v-col>
  </v-footer>
</template>

<style scoped>
ul#ico {
  display: flex;
  justify-content: space-evenly;
  list-style-type: none;
}

.v-btn {
  text-transform: none;
  font-size: 0.87rem;
}
</style>
