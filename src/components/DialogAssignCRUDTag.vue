<template>
  <v-dialog v-model="dialog" persistent max-width="400px">
    <v-card :loading="loadingCRUD">
      <v-toolbar density="compact">
        <v-spacer></v-spacer>
        <v-btn
          style="font-size: x-large"
          icon
          :loading="loadingCRUD"
          @click="refresh"
        >
          ↻
        </v-btn>
        <v-btn icon @click="close">╳</v-btn>
      </v-toolbar>
      <v-card-title
        >Assign {{ employee.name ? employee.name : "" }} an AT tag</v-card-title
      >
      <v-expand-transition>
        <div v-show="alert.show">
          <v-alert rounded="0" :type="alert.type">
            {{ alert.message }}
          </v-alert>
        </div>
      </v-expand-transition>
      <v-card-text v-if="nfcTags.length == 0 && !loadingCRUD">
        No unassigned tags found!
      </v-card-text>
      <v-container>
        <v-row
          v-for="tag in nfcTags"
          :key="tag.id"
          align="center"
          style="text-align: center"
        >
          <v-col cols="6">
            <v-btn
              style="text-transform: none; font-family: monospace"
              rounded="0"
              variant="outlined"
              @click="assignTagToEmployee(tag.id)"
              >{{ tag.id }}</v-btn
            >
          </v-col>
          <v-col cols="6">
            <v-btn
              variant="tonal"
              class="ml-0"
              color="error"
              density="compact"
              icon
              rounded="0"
              @click="deleteTag(tag.id)"
              >X</v-btn
            >
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-btn
              variant="tonal"
              color="success"
              block
              @click="isCreatingTag = !isCreatingTag"
              >Add a new tag</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
      <v-expand-transition>
        <div class="mx-4 mb-2" v-show="isCreatingTag">
          <v-form ref="form" @submit.prevent="addTag" :disabled="loadingCRUD">
            <v-text-field
              max-width="220px"
              rounded="0"
              variant="outlined"
              :rules="[rules.required, rules.isValidTagId]"
              label="Tag ID"
              v-model.trim="newTagId"
              style="font-family: monospace"
              validate-on="blur"
            ></v-text-field>
            <br />
            <v-btn type="submit" :loading="loadingCRUD" color="success"
              >Add</v-btn
            >
          </v-form>
        </div>
      </v-expand-transition>
    </v-card>
  </v-dialog>
</template>
<script>
import { rules } from "../stores/rules";
import { determineErrMessageInAlert } from "../errHandler";
import NFCTagService from "../services/NFCTagService.js";
import { showConfirmDialog } from "../utils/dialogs";

export default {
  emits: ["done"],
  data() {
    return this.initialState();
  },
  methods: {
    initialState() {
      return {
        dialog: false,
        loadingCRUD: false,
        employee: {
          id: null,
          name: null,
        },
        alert: {
          show: false,
          type: "info",
          message: null,
        },
        nfcTags: [],
        isCreatingTag: false,
        rules: rules,
        newTagId: null,
      };
    },
    async addTag() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      this.loadingCRUD = true;
      try {
        const res = await NFCTagService.add(this.newTagId);
        if (res.status == 200) {
          this.refresh();
        }
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.loadingCRUD = false;
      }
    },
    async deleteTag(tagId) {
      const hasConfirmation = showConfirmDialog(1);
      if (!hasConfirmation) {
        return;
      }
      this.loadingCRUD = true;
      try {
        const res = await NFCTagService.deleteOneTag(tagId);
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
      this.resetAlert();
      this.getAllUnassignedTags();
      this.isCreatingTag = false;
      this.$refs.form.reset();
    },
    async assignTagToEmployee(nfcTagId) {
      this.loadingCRUD = true;
      const employeeId = this.employee.id;
      try {
        const res = await NFCTagService.assignTagToEmployee(
          nfcTagId,
          employeeId
        );
        if (res.status == 200) {
          this.close();
          this.$emit("done");
        }
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.loadingCRUD = false;
      }
    },
    async getAllUnassignedTags() {
      this.nfcTags = [];
      this.loadingCRUD = true;
      try {
        const res = await NFCTagService.getAllUnassigned();
        if (res.status == 200) {
          this.nfcTags = res.data;
        }
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.loadingCRUD = false;
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
    close() {
      Object.assign(this.$data, this.initialState());
    },
    open(entity) {
      if (entity) {
        this.employee = Object.assign({}, entity);
        this.dialog = true;
        this.getAllUnassignedTags();
      }
    },
    handleErr(err) {
      const msg = determineErrMessageInAlert(err);
      this.showAlert("error", msg);
    },
  },
};
</script>
<style lang=""></style>
