<!-- eslint-disable vue/valid-v-slot -->
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
        Attendance-Tracked Individuals
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
          :disabled="hasNoSelection"
          >Edit</v-btn
        >
        <v-btn
          tile
          elevation="0"
          @click="validateAndAction('delete')"
          color="error"
          :loading="loadingCRUD"
          :disabled="hasNoSelection"
          >Delete
        </v-btn>
      </v-card-actions>
      <v-card-actions style="justify-content: left">
        <h3>Attendance Tracking tag actions</h3>
        <v-btn
          tile
          elevation="0"
          @click="validateAndAction('assign-tag')"
          color="success"
          :loading="loadingCRUD"
          >Assign</v-btn
        >
        <v-btn
          tile
          elevation="0"
          @click="validateAndAction('unassign-tag')"
          color="error"
          :loading="loadingCRUD"
        >
          Unassign
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
          :items="entities"
          item-value="id"
          show-select
          class="elevation-1"
          select-strategy="single"
        >
        </v-data-table>
      </v-card-text>
      <v-card-text v-if="hasEntities">
        <RowCopyEmployees :pData="entities" />
      </v-card-text>
    </v-card>
    <DialogEditOrAddEmployee ref="dialog_edit_or_add" @done="refresh" />
    <DialogAssignCRUDTag ref="dialog_assign_crud_tag" @done="refresh" />
  </v-dialog>
</template>

<script>
import EmployeeService from "../services/EmployeeService";
import { determineErrMessageInAlert } from "../errHandler";
import { showConfirmDialog } from "../utils/dialogs";
import DialogEditOrAddEmployee from "../components/DialogEditOrAddEmployee.vue";
import DialogAssignCRUDTag from "../components/DialogAssignCRUDTag.vue";
import RowCopyEmployees from "../components/RowCopyEmployees.vue";

export default {
  components: {
    DialogEditOrAddEmployee,
    DialogAssignCRUDTag,
    RowCopyEmployees,
  },
  computed: {
    hasEntities() {
      return this.entities.length > 0;
    },
    hasNoSelection() {
      return this.selected.length === 0;
    },
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
          case "unassign-tag":
            this.unassignTagAndDeleteAssociatedATEs(selectedId);
            break;
          case "assign-tag":
            this.openDialogAssignCRUDTag();
            break;
        }
      } else {
        alert("No row/s selected!");
      }
    },
    getEntityByTableSelection() {
      return this.entities.find((item) => item.id === this.selected[0]);
    },
    openDialogEditOrAdd(mode) {
      if (mode === "edit") {
        const selectedEntity = this.getEntityByTableSelection();
        this.$refs.dialog_edit_or_add.open(selectedEntity);
      } else if (mode === "add") {
        this.$refs.dialog_edit_or_add.open();
      }
    },
    openDialogAssignCRUDTag() {
      const selectedEntity = this.getEntityByTableSelection();
      if (selectedEntity.NFCtagId) {
        alert("Selected employee has been assigned an AT tag already.");
        return;
      }
      this.$refs.dialog_assign_crud_tag.open(selectedEntity);
    },
    async unassignTagAndDeleteAssociatedATEs(id) {
      const hasConfirmation = showConfirmDialog(2);
      if (!hasConfirmation) {
        return;
      }
      this.loadingCRUD = true;
      try {
        const res = await EmployeeService.unassignTagAndDeleteAssociatedATEs(
          id
        );
        if (res.status == 204) {
          this.refresh();
        }
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.loadingCRUD = false;
      }
    },
    async delete(id) {
      const hasConfirmation = showConfirmDialog(1);
      if (!hasConfirmation) {
        return;
      }
      this.loadingCRUD = true;
      try {
        const res = await EmployeeService.delete(id);
        if (res.status == 204) {
          this.refresh();
        } else if (res.status == 200) {
          this.selected = [];
          this.showAlert("warning", res.data);
          this.getAll();
          // not refreshing directly, cuz I want to show an alert to the user!
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
        res = await EmployeeService.getAll();
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
            width: "12%",
          },
          {
            title: "AT tag",
            key: "NFCtagId",
            width: "5%",
          },
          {
            title: "Occupation",
            key: "occupation",
          },
          {
            title: "Assigned Tasks",
            key: "assignedTasks",
            width: "35%",
          },
          {
            title: "Phone №",
            key: "phone",
          },
          {
            title: "Notes",
            key: "notes",
            width: "35%",
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
