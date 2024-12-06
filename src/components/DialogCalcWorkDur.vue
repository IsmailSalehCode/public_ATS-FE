<template>
  <v-dialog v-model="dialog" fullscreen>
    <v-card :loading="isLoading">
      <v-toolbar density="compact">
        <v-spacer></v-spacer>
        <v-btn icon @click="close"> ╳ </v-btn>
      </v-toolbar>
      <v-card-title class="justify-center pt-5 text-center"
        >Employees' Total Work Durations</v-card-title
      >
      <v-expand-transition>
        <div v-show="alert.show">
          <v-alert rounded="0" :type="alert.type">
            {{ alert.message }}
          </v-alert>
        </div>
      </v-expand-transition>
      <hr />
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
              :loading="isLoading"
              @click="refresh"
            >
              ↻
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-card-text>
        <p v-if="isLoading">Loading ...</p>
        <div v-if="!isLoading">
          <p v-if="employees.length === 0">No employees retrieved.</p>
          <ol v-if="processedEmployees.length > 0">
            <li v-for="emp in processedEmployees" :key="emp.id">
              {{ formatProcessedEmployee(emp) }}
            </li>
          </ol>
        </div>
        <!-- {{ processedEmployees }} -->
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
import ATEService from "../services/ATEService";
import { determineErrMessageInAlert } from "../errHandler";
import DatetimePicker from "./DatetimePicker.vue";
export default {
  components: {
    DatetimePicker,
  },
  data() {
    return {
      employees: [],
      isLoading: false,
      dialog: false,
      alert: {
        show: false,
        type: "info",
        message: null,
        startDt: null,
        endDt: null,
      },
    };
  },
  created() {
    const start = this.getStartOfCurrentMonth();
    this.startDt = new Date(start);
    const end = this.getEndOfCurrentMonth();
    this.endDt = new Date(end);
    // console.log(this.startDt, this.endDt); works
  },
  computed: {
    processedEmployees() {
      let result = [];
      const employees = this.employees;
      for (let i = 0; i < employees.length; i++) {
        const employee = employees[i];
        const employeeId = employee.id;
        const employeeName = employee.name;
        let totalDuration = 0;
        let invalidEntries = 0;
        if (employee.NFCtag == null) {
          result.push({ id: employeeId, name: employeeName, hasNoTag: true });
          continue;
        }
        const atentries = employee.NFCtag.AttendanceEntries;
        if (atentries.length === 0) {
          result.push({
            id: employeeId,
            name: employeeName,
            hasNoATEntries: true,
          });
          continue;
        }
        for (let j = 0; j < atentries.length - 1; j++) {
          const atentry = atentries[j];
          const nextAtentry = atentries[j + 1];
          if (atentry.isWorking === nextAtentry.isWorking) {
            // you can go to work twice in a row and/or take a break twice in a row, but it will raise an alert!
            invalidEntries += 1;
            // result.push({ name: employee.name, hasInvalidEntry });
            // continue;
          }
          if (atentry.isWorking === 1 && nextAtentry.isWorking === 0) {
            const startTime = new Date(atentry.createdAt);
            const endTime = new Date(nextAtentry.createdAt);
            totalDuration += endTime - startTime;
          }
        }
        totalDuration = this.millisecondsToHumanReadable(totalDuration);
        result.push({
          id: employeeId,
          name: employeeName,
          invalidEntries: invalidEntries,
          totalWorkDuration: totalDuration,
        });
      }
      // console.log(result);
      return result;
    },
  },
  methods: {
    formatProcessedEmployee(emp) {
      const name = emp.name;
      let result = `${name}`;
      if ("hasNoTag" in emp) {
        return result.concat(" has no Attendance Tracking card assigned!");
      }
      if ("hasNoATEntries" in emp) {
        return result.concat(" has not created any attendance entries!");
      }
      const countInvalidEntries = emp.invalidEntries;
      if (countInvalidEntries > 0) {
        result = result.concat(` has ${countInvalidEntries} INVALID entries!`);
      }
      const totalWorkDuration = emp.totalWorkDuration;
      result = result.concat(` Total work duration: ${totalWorkDuration}`);
      return result;
    },
    async getEachEmployeesATEs() {
      this.isLoading = true;
      this.employees = [];
      try {
        const res = await ATEService.getEachEmployeesATEs(
          this.startDt,
          this.endDt
        );
        this.employees = res.data;
        // console.log(res);
      } catch (err) {
        this.handleErr(err);
      } finally {
        this.isLoading = false;
      }
    },
    millisecondsToHumanReadable(ms) {
      let totalSeconds = Math.floor(ms / 1000);

      const hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;

      const minutes = Math.floor(totalSeconds / 60);

      const seconds = totalSeconds % 60;
      const humanReadable = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;

      return humanReadable;
    },
    refresh() {
      this.resetAlert();
      this.getEachEmployeesATEs();
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
    getStartOfCurrentMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1).setHours(
        0,
        0,
        0,
        0
      );
    },
    getEndOfCurrentMonth() {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); //first day of the next month
      return new Date(nextMonth - 1).setHours(23, 59, 0, 0); // subtract one day to get the last day of the current month
    },
  },
};
</script>
