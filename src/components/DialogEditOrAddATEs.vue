<style scoped>
:deep(.v-select) {
  font-family: monospace;
}

:deep(.v-list-item),
:deep(.v-list-item__content),
:deep(.v-list-item__title) {
  font-family: monospace;
}
</style>
<template>
  <v-dialog v-model="dialog" persistent max-width="500px" transition="none">
    <v-card :loading="loadingCRUD">
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
        :disabled="loadingCRUD"
      >
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <DatetimePicker v-model="entity.createdAt" label="Recorded on" />
            </v-col>
            <v-col cols="12">
              <v-checkbox
                :false-value="0"
                :true-value="1"
                hide-details
                v-model="entity.isWorking"
                label="Begins work?"
              ></v-checkbox>
            </v-col>
            <v-col cols="12">
              <v-select
                label="Kiosk"
                :items="kiosks"
                item-title="name"
                item-value="id"
                v-model="entity.Kiosk.id"
                density="comfortable"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :subtitle="item.raw.isEnabled ? 'Active' : 'Inactive'"
                  ></v-list-item>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12">
              <v-select
                label="Tag"
                :items="tags"
                item-title="id"
                item-value="id"
                v-model="entity.NFCtag.id"
                density="comfortable"
                hint="Employees without an AT tag are excluded from the list."
                persistent-hint
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :subtitle="
                      item.raw.Employee.name +
                      '- ' +
                      formatEmployeeNotes(item.raw.Employee.notes)
                    "
                  ></v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            size="large"
            :loading="loadingCRUD"
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
import ATEService from "../services/ATEService";
import DatetimePicker from "./DatetimePicker.vue";
import KioskService from "../services/KioskService";
import NFCTagService from "@/services/NFCTagService";

export default {
  components: {
    DatetimePicker,
  },
  emits: ["done"],
  data() {
    return this.initialState();
  },
  methods: {
    formatEmployeeNotes(notes) {
      return notes ? notes : "No notes.";
    },
    initialState() {
      return {
        componentModeIsAdd: true,
        rules: rules,
        kiosks: [],
        tags: [],
        alert: {
          show: false,
          type: "info",
          message: null,
        },
        dialog: false,
        loadingCRUD: false,
        entity: {
          id: null,
          isWorking: 0,
          createdAt: new Date(),
          Kiosk: {
            id: null,
            name: null,
          },
          NFCtag: {
            id: null,
            Employee: null,
          },
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
    async populateSelectsKiosksTags() {
      this.loadingCRUD = true;
      try {
        const kiosksRes = await KioskService.getAll();
        this.kiosks = kiosksRes.data;
        const tagsRes = await NFCTagService.getAllAssigned();
        this.tags = tagsRes.data;
        // console.log(kiosksRes, tagsRes);
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.loadingCRUD = false;
      }
    },
    async addOrEditEntity() {
      this.resetAlert();
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }
      this.loadingCRUD = true;
      if (this.componentModeIsAdd) {
        await this.add();
      } else {
        await this.edit();
      }
      this.loadingCRUD = false;
    },
    async add() {
      try {
        const res = await ATEService.add(this.entity.Kiosk.id, {
          goes_to_work: this.entity.isWorking,
          tag_id: this.entity.NFCtag.id,
          createdAt: this.entity.createdAt,
        });
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
        const res = await ATEService.edit({
          id: this.entity.id,
          goes_to_work: this.entity.isWorking,
          kiosk_id: this.entity.Kiosk.id,
          tag_id: this.entity.NFCtag.id,
          createdAt: this.entity.createdAt,
        });
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
        // a deep clone is needed here, cuz there are nested objects. Otherwise we get an undesireable effect: data in parent component gets altered upon making changes to this.entity here.
        this.entity = JSON.parse(JSON.stringify(entity));
        // DatetimePicker inside the component expects a date object for the model value; entity.createdAt should be a date object
        if (typeof this.entity.createdAt === "string") {
          this.entity.createdAt = new Date(this.entity.createdAt);
        }
      }
      this.dialog = true;
      this.populateSelectsKiosksTags();
    },
    handleErr(err) {
      const msg = determineErrMessageInAlert(err);
      this.showAlert("error", msg);
    },
  },
  computed: {
    labelFormTitle() {
      return this.componentModeIsAdd
        ? "Add an Attendance Entry!"
        : `Attendance Entry № ${this.entity.id}`;
    },
    labelBtnSubmit() {
      return this.componentModeIsAdd ? "Add" : "Edit";
    },
  },
};
</script>
