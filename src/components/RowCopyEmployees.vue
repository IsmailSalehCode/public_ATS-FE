<template>
  <v-row>
    <v-col cols="12">
      <h2>Copy data</h2>
    </v-col>
    <v-col style="max-width: fit-content; align-content: center">
      <v-btn color="success" @click="copyETTable" rounded="0"
        >Employees-tags</v-btn
      >
    </v-col>
    <v-col style="max-width: fit-content"
      ><v-checkbox
        hide-details
        label="Include Employees with no tag?"
        v-model="includeEmployeesWithNoTag"
      ></v-checkbox
    ></v-col>
  </v-row>
</template>
<script>
export default {
  props: ["pData"],
  data() {
    return {
      includeEmployeesWithNoTag: true,
    };
  },
  methods: {
    extractDesiredData() {
      const includeEmployeesWithNoTag = this.includeEmployeesWithNoTag;
      let data = [];
      for (let i = 0; i < this.pData.length; i++) {
        const el = this.pData[i];
        const hasTag = el.NFCtagId;
        if (!hasTag) {
          if (includeEmployeesWithNoTag === true) {
            data.push(el);
          } else {
            continue;
          }
        } else {
          data.push(el);
        }
      }
      return data;
    },
    copyETTable() {
      const presentationalHeaders = ["Employee name", "AT tag ID"];
      const actualObjHeaders = ["name", "NFCtagId"];
      let tsvString = presentationalHeaders.join("\t") + "\n"; // add headers
      const cData = this.extractDesiredData();
      cData.forEach((employee) => {
        const row = actualObjHeaders
          .map((header) => employee[header])
          .join("\t");
        tsvString += row + "\n";
      });
      // write to clipboard
      navigator.clipboard.writeText(tsvString).catch((err) => {
        alert("Error copying data to clipboard: ", err);
      });
    },
  },
};
</script>
