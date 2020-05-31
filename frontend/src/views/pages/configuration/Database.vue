<template>
  <div class="card">

    <div class="card-header">
      <h4 class="card-header-title">Database Settings</h4>
    </div>

    <div class="card-body">

      <app-loader :is-loading="!loaded"></app-loader>

      <!-- Row -->
      <div class="row">
        <div class="col-lg-12" v-if="Object.keys(serverConfig).length > 0">

          <b-tabs content-class="mt-5">
            <b-tab title="MySQL Connection (Game)" active>

              <div class="form-row">
                <div class="form-group col-md-4">
                  <label class="form-label">Database Name</label>
                  <input type="text" class="form-control" v-model="serverConfig.server.database.db"/>
                </div>

                <div class="form-group col-md-4">
                  <label class="form-label">Database Host</label>
                  <input type="text" class="form-control" v-model="serverConfig.server.database.host"/>
                </div>

                <div class="form-group col-md-4">
                  <label class="form-label">Database Port</label>
                  <input type="text" class="form-control" v-model="serverConfig.server.database.port"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group col-md-6">
                  <label class="form-label">Database Username</label>
                  <input type="text" class="form-control" v-model="serverConfig.server.qsdatabase.username"/>
                </div>

                <div class="form-group col-md-6">
                  <label class="form-label">Database Password</label>

                  <div class="input-group">
                    <input :type="passwordFieldType" class="form-control"
                           v-model="serverConfig.server.qsdatabase.password"/>
                    <span class="input-group-append">
                  <button class="btn btn-primary" type="button" @click="switchPasswordVisibility()"><i
                    class="fa fa-eye"></i>
                      Show / Hide
                  </button>
                </span>
                  </div>
                </div>
              </div>

            </b-tab>
            <b-tab title="MySQL Connection (QueryServ)" active>

              <div class="form-row">
                <div class="form-group col-md-4">
                  <label class="form-label">Database Name</label>
                  <input type="text" class="form-control" v-model="serverConfig.server.qsdatabase.db"/>
                </div>

                <div class="form-group col-md-4">
                  <label class="form-label">Database Host</label>
                  <input type="text" class="form-control" v-model="serverConfig.server.qsdatabase.host"/>
                </div>

                <div class="form-group col-md-4">
                  <label class="form-label">Database Port</label>
                  <input type="text" class="form-control" v-model="serverConfig.server.qsdatabase.port"/>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group col-md-6">
                  <label class="form-label">Database Username</label>
                  <input type="text" class="form-control" v-model="serverConfig.server.qsdatabase.username"/>
                </div>

                <div class="form-group col-md-6">
                  <label class="form-label">Database Password</label>

                  <div class="input-group">
                    <input :type="passwordFieldType" class="form-control"
                           v-model="serverConfig.server.qsdatabase.password"/>
                    <span class="input-group-append">
                  <button class="btn btn-primary" type="button" @click="switchPasswordVisibility()"><i
                    class="fa fa-eye"></i>
                      Show / Hide
                  </button>
                </span>
                  </div>
                </div>
              </div>

            </b-tab>
          </b-tabs>

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
          this.$toast.info(result.success, 'Saved', { position: 'bottomRight' })
        }
      },
      switchPasswordVisibility() {
        this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password'
      }
    }
  }
</script>
