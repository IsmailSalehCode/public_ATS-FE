<template>
  <v-dialog v-model="dialog" persistent max-width="500px" transition="none">
    <v-card :loading="isSubmitLoading">
      <v-toolbar density="compact">
        <v-spacer></v-spacer>
        <v-btn icon @click="close">╳</v-btn>
      </v-toolbar>
      <v-card-title>{{ labelFormTitle }}</v-card-title>
      <v-expand-transition>
        <div v-show="alert.show">
          <v-alert rounded="0" :type="alert.type">
            {{ alert.message }}
          </v-alert>
        </div>
      </v-expand-transition>
      <v-form
        ref="form"
        @submit.prevent="addOrEditEntity"
        :disabled="isSubmitLoading"
      >
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="E-mail"
                v-model.trim="entity.email"
                :rules="[rules.required, rules.isValidEmail]"
              ></v-text-field>
            </v-col>
            <v-col cols="12" v-if="componentModeIsAdd === true">
              <v-text-field
                validate-on="blur"
                persistent-hint
                hint="Length between 8 and 32 characters. At least one: lowercase letter, uppercase letter, digit, one special character."
                label="Password"
                v-model.trim="entity.password"
                :rules="[rules.required, rules.isValidPassword]"
                counter
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Name"
                v-model.trim="entity.name"
                :rules="[rules.required, rules.max(300)]"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Phone"
                v-model.trim="entity.phone"
                :rules="[rules.max(22)]"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-checkbox
                :false-value="0"
                :true-value="1"
                v-model="entity.isEnabled"
                label="Is Enabled?"
              ></v-checkbox>
            </v-col>
            <v-col cols="6">
              <v-checkbox
                :false-value="0"
                :true-value="1"
                v-model="entity.isAdmin"
                label="Is Admin?"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
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
import UserService from "@/services/UserService";

export default {
  emits: ["done"],
  data() {
    return this.initialState();
  },
  methods: {
    initialState() {
      return {
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
          email: null,
          name: null,
          password: null,
          phone: null,
          isAdmin: 0,
          isEnabled: 1,
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
        const res = await UserService.addUser(this.entity);
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
        const res = await UserService.editUser(this.entity);
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
      return this.componentModeIsAdd ? "Register a new user!" : this.entity.id;
    },
    labelBtnSubmit() {
      return this.componentModeIsAdd ? "Add" : "Edit";
    },
  },
};
</script>
