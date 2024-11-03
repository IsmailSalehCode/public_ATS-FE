<template>
  <v-container>
    <v-card
      :loading="isSubmitLoading || isFPasswordLoading"
      class="mx-auto"
      elevation="12"
      max-width="400px"
    >
      <v-card-title class="text-center text-h3"> ATS Portal </v-card-title>
      <v-expand-transition>
        <div v-show="alert.show">
          <v-alert rounded="0" :type="alert.type">
            {{ alert.message }}
          </v-alert>
        </div>
      </v-expand-transition>
      <v-form
        ref="form"
        @submit.prevent="login"
        :disabled="isSubmitLoading || isFPasswordLoading"
      >
        <v-card-text class="pb-1">
          <v-row>
            <v-col cols="12">
              <!-- Reason for ref="email" => forgot password implementation: To validate just the one field, you need to give that field a ref and call validate() on just that one field's ref. -->
              <v-text-field
                ref="email"
                label="E-mail"
                v-model.trim="email"
                :prepend-icon="iconEmail"
                :rules="[rules.required, rules.isValidEmail]"
                autocomplete="username"
                type="email"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Password"
                v-model.trim="password"
                :prepend-icon="iconLock"
                type="password"
                :rules="[rules.required, rules.isValidPassword]"
                counter
                autocomplete="current-password"
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" class="pt-0">
              <v-btn
                size="small"
                variant="outlined"
                style="text-transform: none"
                @click="forgotPassword"
                :loading="isFPasswordLoading"
              >
                Forgot password?
              </v-btn>
            </v-col>
            <v-col cols="12">
              <Checkbox
                v-model="captchaResponse"
                @success="setCaptchaToken"
                @expired="resetCaptcha"
                @error="resetCaptcha"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            size="large"
            :loading="isSubmitLoading"
            :disabled="isFPasswordLoading"
            color="info"
            type="submit"
            variant="outlined"
            >Log In</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>
<script>
import { rules } from "../stores/rules";
import { mdiEmailOutline, mdiLock } from "@mdi/js";
import AuthenticationService from "../services/AuthenticationService";
import { useAuthStore } from "../stores/auth";
import { Checkbox } from "vue-recaptcha";
import { determineErrMessageInAlert } from "../errHandler";
export default {
  components: {
    Checkbox,
  },
  data() {
    return {
      alert: {
        show: false,
        type: "info",
        message: null,
      },
      captchaResponse: null,
      captchaToken: null,
      email: null,
      password: null,
      rules: rules,
      isSubmitLoading: false,
      isFPasswordLoading: false,
      iconEmail: mdiEmailOutline,
      iconLock: mdiLock,
    };
  },
  methods: {
    async forgotPassword() {
      this.resetAlert();
      this.isFPasswordLoading = true;
      try {
        const arrEmailValidation = await this.$refs.email.validate();
        //1. validate email field
        /* The Vuetify team did the following: when a field is validated, it returns an array. An invalid validation returns an array with at least one element. If the field is valid, the array's length is 0.*/
        if (arrEmailValidation.length !== 0) {
          //email is invalid, exit execution
          throw new Error("Please enter a valid email address.");
        }
        //2. validate captcha
        if (this.captchaToken == null) {
          //no captcha token, exit execution
          throw new Error('Please tick the checkbox "I\'m not a robot".');
        }
        //3. send POST request to forgot-password route
        const forgotPassRes = await AuthenticationService.forgotPassword(
          this.captchaToken,
          this.email
        );
        if (forgotPassRes.status == 200) {
          this.showAlert(
            "info",
            "If an account matches your e-mail address, you should have received instructions on how to reset your password."
          );
        }
      } catch (err) {
        this.showAlert("error", err);
      } finally {
        this.resetCaptcha();
        this.isFPasswordLoading = false;
      }
    },
    resetCaptcha() {
      this.captchaResponse = null;
      this.captchaToken = null;
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
    setCaptchaToken(token) {
      this.captchaToken = token;
    },
    async login() {
      this.resetAlert();
      const { valid } = await this.$refs.form.validate();
      if (valid && this.captchaToken != null) {
        this.isSubmitLoading = true;
        try {
          const res = await AuthenticationService.login(this.captchaToken, {
            email: this.email,
            password: this.password,
          });
          if (res.status == 200) {
            const authStore = useAuthStore();
            const data = res.data;
            authStore.setUser(data.user);
            authStore.setToken(data.token);
            this.reRouteToDashboard();
          }
        } catch (err) {
          const msg = determineErrMessageInAlert(err);
          this.showAlert("error", msg);
          this.resetCaptcha();
        } finally {
          this.isSubmitLoading = false;
        }
      }
    },
    reRouteToDashboard() {
      this.$router.replace("/").catch(() => {});
    },
  },
};
</script>
