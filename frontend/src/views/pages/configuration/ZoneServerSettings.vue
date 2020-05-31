<template>
  <div class="card">

    <div class="card-header">
      <h4 class="card-header-title">Zone Server Settings</h4>
    </div>

    <div class="card-body">

      <app-loader :is-loading="!loaded"></app-loader>

      <!-- Row -->
      <div class="row">
        <div class="col-lg-12" v-if="Object.keys(serverConfig).length > 0">

          <div class="form-row">
            <div class="form-group col-md-4">
              <label class="form-label">Default Player Account Status</label>
              <input type="text" class="form-control" v-model="serverConfig.server.zones.defaultstatus"/>
              <small class="form-text text-muted">This is the default status that new accounts are created
                with, this most likely should be 0
              </small>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Zone Port Range Start</label>
              <input type="number" class="form-control" v-model="serverConfig.server.zones.ports.low"
                     min="7000" max="7500"/>
              <small class="form-text text-muted">Port range start for zone assignment (7000-7500)</small>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Zone Port Range End</label>
              <input type="number" class="form-control" v-model="serverConfig.server.zones.ports.high"
                     min="7000" max="7500"/>
              <small class="form-text text-muted">Port range start for zone assignment (7000-7500)</small>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Bottom Buttons -->
    <div class="card-footer text-right">
      <div class="d-flex">
        <button type="submit" class="btn btn-primary ml-auto" @click="submitServerConfig()">
          <i class="fa fa-save pr-1"></i>
          Save
        </button>
      </div>
    </div>

  </div>
</template>

<script>
  import {EqemuAdminClient} from '@/app/core/eqemu-admin-client'

  export default {
    data() {
      return {
        serverConfig: {},
        passwordFieldType: 'password',
        loaded: false
      }
    },
    async created() {
      this.serverConfig = await EqemuAdminClient.getServerConfig()
      this.loaded       = true
    },
    methods: {
      submitServerConfig: async function () {
        const result = await EqemuAdminClient.postServerConfig(this.serverConfig)

        if (result.success) {
          this.$toast.info(result.success, 'Saved', {position: 'bottomRight'})
        }
      }
    }
  }
</script>
