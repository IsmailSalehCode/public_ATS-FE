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
        Attendance Tracking Kiosks
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
          disable-sort
          :search="search"
          :loading="loadingCRUD"
          v-model="selected"
          :headers="headers"
          :items="entities"
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
          <template v-slot:item.shouldResetLocalDBOnStartup="{ item }">
            {{ item.shouldResetLocalDBOnStartup ? "Yes" : "No" }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <DialogEditOrAddKiosk ref="dialog_edit_or_add" @done="refresh" />
  </v-dialog>
</template>

<script>
import KioskService from "../services/KioskService";
import { determineErrMessageInAlert } from "../errHandler";
import { showConfirmDialog } from "../utils/dialogs";
import DialogEditOrAddKiosk from "../components/DialogEditOrAddKiosk.vue";
export default {
  components: {
    DialogEditOrAddKiosk,
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
        const selectedId = sArr[0];
        switch (action) {
          case "delete":
            this.delete(selectedId);
            break;
          case "edit":
            this.openDialogEditOrAdd(action);
            break;
        }
      } else {
        alert("No row/s selected!");
      }
    },
    openDialogEditOrAdd(mode) {
      if (mode === "edit") {
        const selectedEntity = this.entities.find(
          (item) => item.id === this.selected[0]
        );
        this.$refs.dialog_edit_or_add.open(selectedEntity);
      } else if (mode === "add") {
        this.$refs.dialog_edit_or_add.open();
      }
    },
    async delete(id) {
      const hasConfirmation = showConfirmDialog(1);
      if (!hasConfirmation) {
        return;
      }
      this.loadingCRUD = true;
      try {
        const res = await KioskService.delete(id);
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
      this.getAll();
    },
    async getAll() {
      let res = null;
      this.entities = [];
      this.loadingCRUD = true;
      try {
        res = await KioskService.getAll();
        if (res.status == 200) {
          // console.log(res);
          this.entities = res.data;
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
      entities: [],
      selected: [],
      search: "",
      headers: [
        {
          title: "Name",
          key: "name",
          width: "20%",
        },
        {
          title: "Details",
          key: "details",
          width: "50%",
        },
        {
          title: "Status",
          key: "isEnabled",
        },
        {
          title: "Reset local DB on next startup?",
          key: "shouldResetLocalDBOnStartup",
        },
        {
          title: "Entries' count",
          key: "attendanceEntryCount",
          width: "10%",
        },
      ],
    };
  },
};
</script>
