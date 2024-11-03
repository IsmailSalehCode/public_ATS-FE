<template>
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar density="compact">
        <v-spacer></v-spacer>
        <v-btn
          icon
          :loading="loadingCRUD"
          @click="refresh"
          style="font-size: x-large"
        >
          ↻
        </v-btn>
        <v-btn icon @click="close"> ╳ </v-btn>
      </v-toolbar>
      <v-card-title class="justify-center pt-5 text-center">
        ATS Personnel
      </v-card-title>
      <v-expand-transition>
        <div v-show="alert.show">
          <v-alert rounded="0" :type="alert.type">
            {{ alert.message }}
          </v-alert>
        </div>
      </v-expand-transition>
      <hr />
      <v-card-actions style="justify-content: left">
        <v-btn
          tile
          elevation="0"
          @click="openDialogEditOrAdd('add')"
          color="success"
          :loading="loadingCRUD"
          >Add</v-btn
        >
        <v-btn
          tile
          elevation="0"
          @click="validateAndAction('edit')"
          color="info"
          :loading="loadingCRUD"
          >Edit</v-btn
        >
        <v-btn
          tile
          elevation="0"
          @click="validateAndAction('change-pass')"
          color="warning"
          :loading="loadingCRUD"
          >Change Password</v-btn
        >
        <v-btn
          tile
          elevation="0"
          @click="validateAndAction('delete')"
          color="error"
          :loading="loadingCRUD"
          >Delete
        </v-btn>
      </v-card-actions>
      <v-card-text>
        <v-text-field
          clearable
          density="compact"
          style="max-width: 350px"
          v-model="search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
        <v-data-table
          :search="search"
          :loading="loadingCRUD"
          v-model="selected"
          :headers="headers"
          :items="users"
          item-value="id"
          show-select
          class="elevation-1"
          select-strategy="single"
        >
          <!-- eslint-disable-next-line vue/valid-v-slot-->
          <template v-slot:item.isEnabled="{ item }">
            {{ item.isEnabled ? "Enabled" : "Disabled" }}
          </template>
          <!-- eslint-disable-next-line vue/valid-v-slot-->
          <template v-slot:item.isAdmin="{ item }">
            {{ item.isAdmin ? "Yes" : "No" }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <DialogEditOrAddUser ref="dialog_edit_or_add_user" @done="refresh" />
    <DialogChangeUserPass ref="dialog_change_user_pass" @done="refresh" />
  </v-dialog>
</template>

<script>
import UserService from "../services/UserService";
import { determineErrMessageInAlert } from "../errHandler";
import DialogEditOrAddUser from "../components/DialogEditOrAddUser.vue";
import DialogChangeUserPass from "../components/DialogChangeUserPass.vue";
import { showConfirmDialog } from "../utils/dialogs";
export default {
  components: {
    DialogEditOrAddUser,
    DialogChangeUserPass,
  },
  methods: {
    showAlert(pType, pMessage) {
      this.alert = {
        show: true,
        type: pType,
        message: pMessage,
      };
    },
    resetAlert() {
      this.alert = {
        show: false,
        type: "info",
        message: null,
      };
    },
    validateAndAction(action) {
      const sArr = this.selected;
      if (sArr.length == 1) {
        const selectedUserId = sArr[0];
        switch (action) {
          case "delete":
            this.deleteUser(selectedUserId);
            break;
          case "change-pass":
            this.openChangePassDialog();
            break;
          case "edit":
            this.openDialogEditOrAdd(action);
            break;
        }
      } else {
        alert("No row/s selected!");
      }
    },
    getEntityByTableSelection() {
      return this.users.find((item) => item.id === this.selected[0]);
    },
    openChangePassDialog() {
      const selectedEntity = this.getEntityByTableSelection();
      this.$refs.dialog_change_user_pass.open(selectedEntity);
    },
    openDialogEditOrAdd(mode) {
      if (mode === "edit") {
        const selectedEntity = this.getEntityByTableSelection();
        this.$refs.dialog_edit_or_add_user.open(selectedEntity);
      } else if (mode === "add") {
        this.$refs.dialog_edit_or_add_user.open();
      }
    },
    async deleteUser(id) {
      const hasConfirmation = showConfirmDialog(1);
      if (!hasConfirmation) {
        return;
      }
      this.loadingCRUD = true;
      try {
        const res = await UserService.deleteUser(id);
        if (res.status == 204) {
          this.refresh();
        }
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.loadingCRUD = false;
      }
    },
    refresh() {
      this.selected = [];
      this.resetAlert();
      this.getUsers();
    },
    async getUsers() {
      let res = null;
      this.users = [];
      this.loadingCRUD = true;
      try {
        res = await UserService.getUsers();
        if (res.status == 200) {
          this.users = res.data;
        }
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.loadingCRUD = false;
      }
    },
    open() {
      this.dialog = true;
      this.refresh();
    },
    close() {
      this.dialog = false;
    },
    handleErr(err) {
      const msg = determineErrMessageInAlert(err);
      this.showAlert("error", msg);
    },
    // UIBoolToWord(pBool) {
    //   switch (pBool.toString()) {
    //     case "1":
    //       return "Yes";
    //     case "0":
    //       return "No";
    //     default:
    //       return "Invalid value";
    //   }
    // },
  },
  data() {
    return {
      alert: {
        show: false,
        type: "info",
        message: null,
      },
      dialog: false,
      loadingCRUD: false,
      users: [],
      selected: [],
      search: "",
      headers: [
        {
          title: "Name",
          key: "name",
        },
        {
          title: "E-mail",
          key: "email",
        },
        // {
        //   title: "Password",
        //   key: "password",
        // }, excluded, cuz hashed
        {
          title: "Phone",
          key: "phone",
        },
        {
          title: "Status",
          key: "isEnabled",
          width: "2%",
        },
        {
          title: "Is Admin?",
          key: "isAdmin",
          width: "2%",
        },
      ],
    };
  },
  // watch: {
  //   selected() {
  //     console.log(this.selected);
  //   },
  // }, // works without exposing id on the UI
};
</script>

<style></style>
