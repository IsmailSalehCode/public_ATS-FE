<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar density="compact">
        <v-spacer></v-spacer>
        <v-btn icon @click="close"> ╳ </v-btn>
      </v-toolbar>
      <v-card-title class="justify-center pt-5 text-center">
        Attendance Entries
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
          @click="openDialogEditOrAdd('edit')"
          color="info"
          :loading="loadingCRUD"
          :disabled="this.selected.length != 1"
          >Edit</v-btn
        >
        <v-btn
          tile
          elevation="0"
          @click="deleteEntity"
          color="error"
          :loading="loadingCRUD"
          :disabled="this.selected.length == 0"
          >Delete
        </v-btn>
      </v-card-actions>
      <v-container fluid style="max-width: 840px">
        <v-row no-gutters justify="center">
          <v-col cols="12" sm="5">
            <DatetimePicker label="Start" v-model="startDt"> </DatetimePicker>
          </v-col>
          <v-col cols="12" sm="5">
            <DatetimePicker label="End" v-model="endDt"> </DatetimePicker>
          </v-col>
          <v-col
            cols="12"
            sm="2"
            style="text-align: center; max-width: fit-content"
          >
            <v-btn
              variant="outlined"
              density="compact"
              type="submit"
              icon
              :loading="loadingCRUD"
              @click="refresh"
            >
              ↻
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
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
          :items="entities"
          item-value="id"
          show-select
          class="elevation-1"
          select-strategy="page"
        >
          <template v-slot:item.isWorking="{ item }">
            {{ item.isWorking ? "Work" : "Rest" }}
          </template>
          <template v-slot:item.createdAt="{ item }">
            {{ timestampToLocale(item.createdAt) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <DialogEditOrAddATEs ref="dialog_edit_or_add" @done="refresh" />
  </v-dialog>
</template>

<script>
import { rules } from "../stores/rules";
import ATEService from "../services/ATEService";
import { determineErrMessageInAlert } from "../errHandler";
import { showConfirmDialog } from "../utils/dialogs";
import DialogEditOrAddATEs from "./DialogEditOrAddATEs.vue";
import timestampToLocale from "../utils/formatters";
import DatetimePicker from "./DatetimePicker.vue";

export default {
  mixins: [timestampToLocale],
  components: {
    DialogEditOrAddATEs,
    DatetimePicker,
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
    async deleteEntity() {
      const hasConfirmation = showConfirmDialog(1);
      if (!hasConfirmation) {
        return;
      }
      this.loadingCRUD = true;
      try {
        for (let i = 0; i < this.selected.length; i++) {
          const id = this.selected[i];
          await ATEService.delete(id);
        }
        this.refresh();
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.loadingCRUD = false;
      }
    },
    refresh() {
      this.selected = [];
      this.resetAlert();
      this.getAllATEs();
    },
    async getAllATEs() {
      let res = null;
      this.entities = [];
      this.loadingCRUD = true;
      try {
        res = await ATEService.getAllATEs(this.startDt, this.endDt);
        if (res.status == 200) {
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
      Object.assign(this.$data, this.initialState());
    },
    handleErr(err) {
      const msg = determineErrMessageInAlert(err);
      this.showAlert("error", msg);
    },
    initialState() {
      return {
        rules: rules,
        startDt: new Date(new Date().setHours(0, 0, 0, 0)),
        endDt: new Date(new Date().setHours(23, 59, 0, 0)),
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
        /**[ { "id": 10, "isWorking": 0, "createdAt": "2024-07-01T09:20:00.000Z", "Kiosk": { "name": "k1" }, "NFCtag": { "id": "5d4429a2", "employeeId": 2, "Employee": { "name": "ХАЛЕД ЯХИЯ АБУ ШЕЛЕ" } } }, { "id": 9, "isWorking": 1, "createdAt": "2024-07-01T09:00:00.000Z", "Kiosk": { "name": "k1" }, "NFCtag": { "id": "5d4429a2", "employeeId": 2, "Employee": { "name": "ХАЛЕД ЯХИЯ АБУ ШЕЛЕ" } } }, { "id": 8, "isWorking": 0, "createdAt": "2024-07-01T20:59:59.000Z", "Kiosk": { "name": "k1" }, "NFCtag": { "id": "6d738fa1", "employeeId": 1, "Employee": { "name": "АДЕЛ ХАЛИЛ АЛСАЛЕМ" } } }, { "id": 7, "isWorking": 1, "createdAt": "2024-06-30T21:00:00.000Z", "Kiosk": { "name": "k1" }, "NFCtag": { "id": "6d738fa1", "employeeId": 1, "Employee": { "name": "АДЕЛ ХАЛИЛ АЛСАЛЕМ" } } } ]*/
        headers: [
          {
            title: "Kiosk name",
            key: "Kiosk.name",
          },
          {
            title: "Employee name",
            key: "NFCtag.Employee.name",
          },
          {
            title: "AT tag",
            key: "NFCtag.id",
          },
          {
            title: "Activity",
            key: "isWorking",
          },
          {
            title: "Recorded on",
            key: "createdAt",
          },
        ],
      };
    },
  },
  data() {
    return this.initialState();
  },
};
</script>
