<template>
  <div class="card">

    <div class="card-header">
      <h4 class="card-header-title">Universal Chat Service Settings</h4>
    </div>

    <div class="card-body">

      <app-loader :is-loading="!loaded"></app-loader>

      <!-- Row -->
      <div class="row">
        <div class="col-lg-12" v-if="Object.keys(serverConfig).length > 0">
          <div class="form-row">
            <div class="form-group col-md-6">
              <label class="form-label">Chatserver Host</label>
              <input type="text" class="form-control" placeholder="0.0.0.0"
                     v-model="serverConfig.server.chatserver.host"/>
            </div>

            <div class="form-group col-md-6">
              <label class="form-label">Chatserver Port</label>
              <input type="text" class="form-control" v-model="serverConfig.server.chatserver.port"/>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-md-6">
              <label class="form-label">Mailserver Host</label>
              <input type="text" class="form-control" placeholder="0.0.0.0"
                     v-model="serverConfig.server.mailserver.host"/>
            </div>

            <div class="form-group col-md-6">
              <label class="form-label">Mailserver Port</label>
              <input type="text" class="form-control" v-model="serverConfig.server.mailserver.port"/>
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

      this.loaded = true
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
