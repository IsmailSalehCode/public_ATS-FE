<template>
  <v-dialog v-model="dialog" persistent max-width="500px" transition="none">
    <v-card :loading="isLoading">
      <v-toolbar density="compact">
        <v-spacer></v-spacer>
        <v-btn icon @click="close">╳</v-btn>
      </v-toolbar>
      <v-card-title>{{ cardTitle }}</v-card-title>
      <v-expand-transition>
        <div v-show="alert.show">
          <v-alert rounded="0" :type="alert.type">
            {{ alert.message }}
          </v-alert>
        </div>
      </v-expand-transition>
      <v-card-text>
        Length should be between 8 and 32 characters. Include at least one:
        lowercase letter, uppercase letter, digit and special character.
      </v-card-text>
      <v-form ref="form" @submit.prevent="changePass" :disabled="isLoading">
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                validate-on="blur"
                label="New Password"
                v-model.trim="newPass"
                :rules="[rules.required, rules.isValidPassword]"
                counter
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                validate-on="blur"
                @click.right.prevent
                :disabled="!newPass"
                label="Confirm"
                placeholder="Re-type it"
                v-model.trim="confirmPass"
                :rules="[rules.required, rules.equals(this.newPass)]"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn size="large" :loading="isLoading" color="info" type="submit"
            >submit</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script>
import { rules } from "../stores/rules";
import { determineErrMessageInAlert } from "../errHandler";
import UserService from "../services/UserService";

export default {
  emits: ["done"],
  data() {
    return this.initialState();
  },
  methods: {
    initialState() {
      return {
        entity: {
          id: null,
          name: null,
        },
        rules: rules,
        alert: {
          show: false,
          type: "info",
          message: null,
        },
        dialog: false,
        isLoading: false,
        confirmPass: null,
        newPass: null,
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
    async changePass() {
      this.resetAlert();
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      this.isLoading = true;
      try {
        const res = await UserService.changePass(this.entity.id, this.newPass);
        if (res.status == 200) {
          this.close();
          this.$emit("done");
        }
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.isLoading = false;
      }
    },
    close() {
      Object.assign(this.$data, this.initialState());
    },
    open(entity) {
      this.entity = Object.assign({}, entity);
      this.dialog = true;
    },
    handleErr(err) {
      const msg = determineErrMessageInAlert(err);
      this.showAlert("error", msg);
    },
  },
  computed: {
    cardTitle() {
      const name = this.entity.name;
      return name ? `Change ${name}'s password` : "nobody";
    },
  },
};
</script>
