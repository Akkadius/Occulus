<template>
  <div>

    <div class="row justify-content-between align-items-center mb-5 mt-5">
      <div class="col-12 col-md-9 col-xl-7">
        <h2 class="mb-2">
          Server Rules
        </h2>
        <p class="text-muted mb-md-0">
          Server rules can change the behavior of your server
        </p>
      </div>
    </div>

    <hr class="mt-5">

    <div class="input-group input-group-lg input-group-merge mb-3">
      <input
        type="text"
        class="form-control form-control-prepended list-search"
        @keyup="filterRules"
        v-model="ruleFilter"
        placeholder="Search rules..."
      >

      <div class="input-group-prepend">
        <div class="input-group-text">
          <span class="fe fe-search"></span>
        </div>
      </div>

    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">

          <div class="card-header">
            Rows ({{ filteredRules.length }})
          </div>

          <div class="table-responsive mb-0">
            <table class="table table-sm table-nowrap card-table" style="table-layout: fixed;">
              <thead>
              <tr role="row">
                <th class="sorting" tabindex="0" style="width: 60px">ID</th>
                <th class="sorting" tabindex="0" style="width: 300px !important">Rule Name</th>
                <th class="sorting" tabindex="0" style="width: 300px">Description</th>
                <th class="sorting" tabindex="0">Value</th>
              </tr>
              </thead>
              <tbody>

              <!-- Loop through rules -->
              <tr v-for="(rule, index) in filteredRules" :key="index">
                <td class="">{{ rule.ruleset_id }}</td>
                <td>{{ rule.rule_name }}</td>

                <td class="text-muted" style="overflow: auto; white-space: normal;">
                  {{ rule.notes }}
                </td>

                <td>

                  <label
                    class="pb-2 pt-2"
                    v-if="rule.rule_value === 'true' || rule.rule_value === 'false'"
                  >
                    <input
                      type="checkbox"
                      name="custom-switch-checkbox"
                      v-bind:true-value="'true'"
                      v-bind:false-value="'false'"
                      v-model="rule.rule_value"
                      @change="updateRule(rule)"
                      class="custom-switch-input"
                    >
                    <span class="custom-switch-indicator"></span>
                  </label>

                  <span v-if="!(rule.rule_value === 'true' || rule.rule_value === 'false')">
                      <input
                        type="text" class="form-control"
                        v-model="rule.rule_value"
                        @change="updateRule(rule)"
                      >
                  </span>

                  <!-- {{rule.rule_value}} -->
                </td>

              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {EqemuAdminClient} from '@/app/core/eqemu-admin-client'

export default {
  data() {
    return {
      rules: null,
      filteredRules: null,
      loaded: false,
      ruleFilter: null
    }
  },
  async created() {
    this.rules = await EqemuAdminClient.getServerRules();
    this.filterRules();
    this.loaded = true;
    this.initTable()
  },
  methods: {
    async updateRule(rule) {
      const response = await EqemuAdminClient.postServerRule(rule);
      if (response.success) {
        this.$toast.info(
          response.success,
          'Rule Updated',
          { position: 'bottomRight' }
        )
      }
    },
    filterRules() {
      if (!this.ruleFilter) {
        this.filteredRules = this.rules;
        return;
      }

      let filteredRules = [];
      this.rules.forEach(row => {
        if (
          row.rule_name.toLowerCase().includes(this.ruleFilter.toLowerCase()) ||
          row.notes.toLowerCase().includes(this.ruleFilter.toLowerCase())
        ) {
          filteredRules.push(row)
        }
      });

      this.filteredRules = filteredRules
    }
  }
}
</script>
