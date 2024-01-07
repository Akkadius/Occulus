<template>
  <div>

    <div class="row justify-content-between align-items-center mt-5">
      <div class="col-12 col-md-9 col-xl-7">
        <h2 class="mb-2">
          Universal Chat Service
        </h2>
        <p class="text-muted mb-md-0">
          Mail and Chat server configuration properties
        </p>
      </div>

      <div class="col-12 col-md-auto">
        <button type="submit" class="btn btn-primary ml-auto" @click="submitServerConfig()">
          <i class="fe fe-save"></i>
          Save
        </button>
      </div>
    </div>

    <hr class="mt-5">

    <div class="row">
      <div class="col-lg-12" v-if="Object.keys(serverConfig).length > 0">
        <div class="form-row">
          <div class="form-group col-md-6">
            <label class="form-label">Host</label>
            <input type="text" class="form-control" placeholder="0.0.0.0"
                   v-model="serverConfig.server.ucs.host"/>
          </div>

          <div class="form-group col-md-6">
            <label class="form-label">Port</label>
            <input type="text" class="form-control" v-model="serverConfig.server.ucs.port"/>
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
        serverConfig: {},
        passwordFieldType: 'password',
        loaded: false
      }
    },
    async created() {
      this.serverConfig = await EqemuAdminClient.getServerConfig()

      if (!this.serverConfig.server.ucs) {
        this.serverConfig.server.ucs = {
          host: "",
          port: "",
        }
      }

      this.loaded = true
    },
    methods: {
      submitServerConfig: async function () {
        const result = await EqemuAdminClient.postServerConfig(this.serverConfig)

        if (result.success) {
          this.$toast.info(result.success, 'Saved', { position: 'bottomRight' })
        }
      }
    }
  }
</script>
