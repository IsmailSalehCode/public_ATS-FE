<template>
  <v-container>
    <h1>Welcome, {{ username }}!</h1>
    <p>{{ infoPrivilege }}</p>
    <p>Your contact info: {{ userEmail }}, {{ userPhone }}.</p>
    <p>This information has been retrieved on {{ dtTokenIssuedAt }}</p>
    <p>You must log in again at the latest on {{ dtTokenExpiresAt }}</p>
    <p style="color: red">
      If you are using a shared device, please log out after you are done!
    </p>
  </v-container>
  <v-container class="container-actions">
    <h2 class="pb-4">Manage resources</h2>
    <v-row>
      <v-col v-if="isAdmin" style="max-width: fit-content">
        <v-btn variant="outlined" @click="openDialog('manage-users')"
          >Users</v-btn
        >
      </v-col>
      <v-col style="max-width: fit-content">
        <v-btn variant="outlined" @click="openDialog('manage-kiosks')"
          >Kiosks</v-btn
        >
      </v-col>
      <v-col style="max-width: fit-content">
        <v-btn variant="outlined" @click="openDialog('manage-employees')"
          >Employees & AT tags</v-btn
        >
      </v-col>
      <v-col style="max-width: fit-content">
        <v-btn variant="outlined" @click="openDialog('manage-ates')"
          >Attendance Entries</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
  <v-container>
    <h2 class="pb-4">Calculate</h2>
    <v-row>
      <v-col style="max-width: fit-content">
        <v-btn variant="outlined" @click="openDialog('calc-work-dur')"
          >Employees' Total Work Durations</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
  <DialogManageUsers ref="manage_users" />
  <DialogManageKiosks ref="manage_kiosks" />
  <DialogManageEmployees ref="manage_employees" />
  <DialogManageATEs ref="manage_ates" />
  <DialogCalcWorkDur ref="calc_work_dur" />
</template>

<script>
import { useAuthStore } from "../stores/auth";
import DialogManageUsers from "../components/DialogManageUsers.vue";
import DialogManageKiosks from "../components/DialogManageKiosks.vue";
import DialogManageEmployees from "../components/DialogManageEmployees.vue";
import DialogManageATEs from "../components/DialogManageATEsV2.vue";
import DialogCalcWorkDur from "../components/DialogCalcWorkDur.vue";
export default {
  components: {
    DialogManageUsers,
    DialogManageKiosks,
    DialogManageEmployees,
    DialogManageATEs,
    DialogCalcWorkDur,
  },
  methods: {
    openDialog(action) {
      switch (action) {
        case "manage-employees":
          this.$refs.manage_employees.open();
          break;
        case "manage-users":
          this.$refs.manage_users.open();
          break;
        case "manage-kiosks":
          this.$refs.manage_kiosks.open();
          break;
        case "manage-ates":
          this.$refs.manage_ates.open();
          break;
        case "calc-work-dur":
          this.$refs.calc_work_dur.open();
          break;
      }
    },
    timeToLocaleDate(time) {
      const msTime = time * 1000;
      return new Date(msTime).toLocaleString("bg");
    },
  },
  computed: {
    dtTokenExpiresAt() {
      return this.timeToLocaleDate(this.authStore.token.expiresAt);
    },
    dtTokenIssuedAt() {
      return this.timeToLocaleDate(this.authStore.token.issuedAt);
    },
    user() {
      return this.authStore.user;
    },
    userPhone() {
      const phone = this.user.phone;
      return phone ? phone : "missing phone number";
    },
    userEmail() {
      return this.user.email;
    },
    username() {
      return this.user.name;
    },
    isAdmin() {
      return this.user.isAdmin;
    },
    infoPrivilege() {
      const isAdmin = this.isAdmin;
      const phrase = isAdmin ? "" : " do not";
      return `You${phrase} have admin privileges.`;
    },
  },
  data() {
    return {
      authStore: useAuthStore(),
    };
  },
};
</script>
<style>
.container-actions {
  /* border: solid; */
  border-top: black solid 2px;
  border-bottom: black solid 2px;
}
</style>
