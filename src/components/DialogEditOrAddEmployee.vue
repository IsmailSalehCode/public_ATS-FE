<template>
  <v-dialog v-model="dialog" persistent max-width="500px" transition="none">
    <v-card :loading="isSubmitLoading">
      <v-toolbar density="compact">
        <v-spacer></v-spacer>
        <v-btn icon @click="close">╳</v-btn>
      </v-toolbar>
      <v-card-title>{{ labelFormTitle }}</v-card-title>
      <v-form
        ref="form"
        @submit.prevent="addOrEditEntity"
        :disabled="isSubmitLoading"
      >
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="Name"
                v-model.trim="entity.name"
                :rules="[rules.required, rules.max(maxLength.name)]"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                bg-color="success"
                clearable
                label="Assigned Tasks"
                v-model.trim="entity.assignedTasks"
                :rules="[rules.max(maxLength.assignedTasks)]"
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Occupation"
                v-model.trim="entity.occupation"
                :rules="[rules.max(maxLength.occupation)]"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Phone number"
                v-model.trim="entity.phone"
                width="240px"
                :rules="[rules.max(maxLength.phone)]"
              ></v-text-field>
            </v-col>
            <v-col>
              <v-textarea
                bg-color="amber-lighten-4"
                color="warning"
                clearable
                v-model="entity.notes"
                label="Notes"
                :rules="[rules.max(maxLength.notes)]"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-expand-transition>
          <div v-show="alert.show">
            <v-alert rounded="0" :type="alert.type">
              {{ alert.message }}
            </v-alert>
          </div>
        </v-expand-transition>
        <v-card-actions class="justify-center">
          <v-btn
            size="large"
            :loading="isSubmitLoading"
            color="info"
            type="submit"
            >{{ labelBtnSubmit }}</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script>
import { rules } from "../stores/rules";
import { determineErrMessageInAlert } from "../errHandler";
import EmployeeService from "../services/EmployeeService";

export default {
  emits: ["done"],
  data() {
    return this.initialState();
  },
  methods: {
    initialState() {
      return {
        maxLength: {
          name: 200,
          notes: 50000,
          occupation: 100,
          phone: 22,
          assignedTasks: 50000,
        },
        componentModeIsAdd: true,
        rules: rules,
        alert: {
          show: false,
          type: "info",
          message: null,
        },
        dialog: false,
        isSubmitLoading: false,
        entity: {
          id: null,
          name: null,
          notes: null,
          occupation: null,
          phone: null,
          assignedTasks: null,
        },
      };
    },
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
    async addOrEditEntity() {
      this.resetAlert();
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      this.isSubmitLoading = true;
      if (this.componentModeIsAdd) {
        await this.add();
      } else {
        await this.edit();
      }
      this.isSubmitLoading = false;
    },
    async add() {
      try {
        const res = await EmployeeService.add(this.entity);
        if (res.status == 200) {
          this.close();
          this.$emit("done");
        }
      } catch (err) {
        this.handleErr(err);
      }
    },
    async edit() {
      try {
        const res = await EmployeeService.edit(this.entity);
        if (res.status == 200) {
          this.close();
          this.$emit("done");
        }
      } catch (err) {
        this.handleErr(err);
      }
    },
    close() {
      Object.assign(this.$data, this.initialState());
    },
    open(entity) {
      if (!entity) {
        this.componentModeIsAdd = true;
      } else {
        this.componentModeIsAdd = false;
        this.entity = Object.assign({}, entity);
      }
      this.dialog = true;
    },
    handleErr(err) {
      const msg = determineErrMessageInAlert(err);
      this.showAlert("error", msg);
    },
  },
  computed: {
    labelFormTitle() {
      return this.componentModeIsAdd ? "Add a new employee!" : this.entity.id;
    },
    labelBtnSubmit() {
      return this.componentModeIsAdd ? "Add" : "Edit";
    },
  },
};
</script>
