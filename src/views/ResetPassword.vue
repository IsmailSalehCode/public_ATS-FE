<template>
  <v-container>
    <v-card
      :loading="isSubmitLoading"
      class="mx-auto"
      elevation="12"
      max-width="400px"
    >
      <v-card-title class="text-center text-h4">Reset Password</v-card-title>
      <v-expand-transition>
        <div v-show="alert.show">
          <v-alert rounded="0" :type="alert.type">
            {{ alert.message }}
          </v-alert>
        </div>
      </v-expand-transition>
      <v-form
        ref="form"
        @submit.prevent="submitResetPass"
        :disabled="isSubmitLoading"
        v-if="!isPasswordResetDone"
      >
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                autocomplete="new-password"
                label="New password"
                v-model.trim="newPass"
                type="password"
                :rules="[rules.required, rules.isValidPassword]"
                counter
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                autocomplete="off"
                label="Confirm password"
                v-model.trim="confirmPass"
                type="password"
                :rules="[
                  rules.required,
                  rules.isValidPassword,
                  rules.equals(this.newPass),
                ]"
                counter
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            size="large"
            :loading="isSubmitLoading"
            type="submit"
            variant="outlined"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>
<script>
import { rules } from "../stores/rules";
import { determineErrMessageInAlert } from "../errHandler";
import AuthenticationService from "@/services/AuthenticationService";

export default {
  computed: {
    isPasswordResetDone() {
      return this.alert.type === "success";
    },
  },
  methods: {
    async submitResetPass() {
      this.resetAlert();
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      this.isSubmitLoading = true;
      try {
        const res = await AuthenticationService.changePass(
          this.resetToken,
          this.newPass
        );
        if (res.status == 200) {
          this.showAlert(
            "success",
            "Done! You may try logging in with your new password."
          );
        }
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.isSubmitLoading = false;
      }
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
    handleErr(err) {
      const msg = determineErrMessageInAlert(err);
      this.showAlert("error", msg);
    },
  },
  mounted() {
    this.resetToken = this.$route.params.resetToken;
  },
  data() {
    return {
      newPass: null,
      confirmPass: null,
      resetToken: null,
      rules: rules,
      isSubmitLoading: false,
      alert: {
        show: false,
        type: "info",
        message: null,
      },
    };
  },
};
</script>
<style></style>
