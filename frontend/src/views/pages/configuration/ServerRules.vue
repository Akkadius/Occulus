<template>
  <div class="card">

    <div class="card-header">
      <h4 class="card-header-title">Server Rules</h4>
    </div>

    <div class="card-body">

      <app-loader :is-loading="!loaded"></app-loader>

      <!-- Row -->
      <div class="row" v-show="loaded">
        <div class="col-lg-12">

          <!-- Table -->
          <table class="table card-table table-vcenter text-wrap datatable dataTable no-footer"
                 id="DataTables_Table_0"
                 role="grid"
                 style="width:100%;table-layout:fixed"
          >
            <thead>
            <tr role="row">
              <th class="sorting" tabindex="0" style="width: 120px">Ruleset ID</th>
              <th class="sorting" tabindex="0" style="width: 300px">Rule Name</th>
              <th class="sorting" tabindex="0">Value</th>
              <th class="sorting" tabindex="0">Description</th>
            </tr>
            </thead>
            <tbody>

            <!-- Loop through rules -->
            <tr role="row" class="odd" v-for="(rule, index) in rules" :key="index"
                style="word-wrap:break-word">
              <td class="">{{rule.ruleset_id}}</td>
              <td class="">{{rule.rule_name}}</td>
              <td class="">

                <label class="pb-2 pt-2"
                       v-if="rule.rule_value === 'true' || rule.rule_value === 'false'">
                  <input type="checkbox"
                         name="custom-switch-checkbox"
                         v-bind:true-value="'true'"
                         v-bind:false-value="'false'"
                         v-model="rule.rule_value"
                         @change="updateRule(rule)"
                         class="custom-switch-input">
                  <span class="custom-switch-indicator"></span>
                </label>

                <span v-if="Number.isInteger(parseInt(rule.rule_value))">
                                    <input type="text" class="form-control"
                                           v-model="rule.rule_value"
                                           @change="updateRule(rule)"
                                    >
                                </span>

                <!-- {{rule.rule_value}} -->
              </td>
              <td style="word-wrap:break-word">{{rule.notes}}</td>
            </tr>
            </tbody>
          </table>
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
        rules: {},
        loaded: false
      }
    },
    async created() {
      this.rules  = await EqemuAdminClient.getServerRules()
      this.loaded = true
      this.initTable()
    },
    methods: {
      async updateRule(rule) {
        const response = await EqemuAdminClient.postServerRule(rule)
        if (response.success) {
          this.$toast.info(
            response.success,
            'Rule Updated',
            {position: 'bottomRight'}
          )
        }
      },
      initTable() {
        this.$nextTick(() => {
          $('.datatable').DataTable({
            'pageLength': 20,
            'bPaginate': true,
            'bLengthChange': false,
            'bFilter': true,
            'bInfo': false,
            'bAutoWidth': false,
            language: {search: '', searchPlaceholder: 'Search...'}
          })

          $('.dataTables_filter').css('float', 'left')
          $('.dataTables_filter').css('margin', '0')
          $('.dataTables_filter').css('width', '100%')
          $('.dataTables_filter *').css('width', '100%')
          $('.dataTables_filter input').addClass('mb-2 form-control')
        })
      }
    }
  }
</script>
