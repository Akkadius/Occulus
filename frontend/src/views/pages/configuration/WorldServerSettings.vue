<template>
  <div class="card">

    <div class="card-header">
      <h4 class="card-header-title">World Server Settings</h4>

      <button type="submit" class="btn btn-primary ml-auto" @click="submitServerConfig()">
        <i class="fa fa-save pr-1"></i>
        Save
      </button>
    </div>

    <div class="card-body">

      <app-loader :is-loading="!loaded"></app-loader>

      <!-- Row -->
      <div class="row">
        <div class="col-lg-12" v-if="Object.keys(serverConfig).length > 0">
          <div class="form-row">
            <div class="form-group col-md-6">
              <label class="form-label">Server Long Name</label>
              <input type="text" class="form-control" v-model="serverConfig.server.world.longname"/>
              <small class="form-text text-muted">Displays on the Loginserver</small>
            </div>

            <div class="form-group col-md-6">
              <label class="form-label">Server Short Name</label>
              <input type="text" class="form-control" v-model="serverConfig.server.world.shortname"/>
              <small class="form-text text-muted">Used in the client .ini configuration files</small>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Server Key</label>

            <div class="input-group">
              <input type="text" class="form-control" v-model="serverConfig.server.world.key"/>
              <span class="input-group-append">
                              <button class="btn btn-primary" type="button" @click="generateRandomKey()"><i
                                class="fa fa-history pr-1"></i>
                                  Generate Random Key
                              </button>
                            </span>
            </div>

            <small class="form-text text-muted">Used in inter-server communication and allows remote
              zoneservers to connect back
            </small>
          </div>

          <h4>Telnet</h4>

          <label class="pb-2 pt-2">

            <div class="custom-control custom-checkbox checklist-control">
              <input class="custom-control-input" id="checklistOne" type="checkbox" v-model="serverConfig.server.world.telnet.enabled"/>
              <label class="custom-control-label" for="checklistOne"></label>
              <span >
                Keep this on or admin panel functionality will break
              </span>
            </div>

          </label>

          <div class="form-row">
            <div class="form-group col-md-6" v-show="serverConfig.server.world.telnet.enabled">
              <label class="form-label">Telnet IP</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.telnet.ip"/>
              <small class="form-text text-muted">IP address to listen to telnet on. (0.0.0.0) works in
                most scenarios
              </small>
            </div>

            <div class="form-group col-md-6" v-show="serverConfig.server.world.telnet.enabled">
              <label class="form-label">Telnet IP</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.telnet.port"/>
              <small class="form-text text-muted">Port for telnet to listen on. Keep this at 9000
              </small>
            </div>
          </div>

          <h4>TCP Connections</h4>

          <div class="form-row">
            <div class="form-group col-md-6">
              <label class="form-label">IP</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.tcp.ip"/>
              <small class="form-text text-muted">IP address to world to listen on. (0.0.0.0) works in
                most
                scenarios
              </small>
            </div>

            <div class="form-group col-md-6">
              <label class="form-label">Port</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.tcp.port"/>
              <small class="form-text text-muted">Port for world to listen on. Keep this at 9000
              </small>
            </div>
          </div>

          <hr>

          <h3>Loginserver Connections</h3>

          <hr>

          <h4>Connection #1</h4>

          <div class="form-row" v-if="serverConfig.server.world.loginserver1">
            <div class="form-group col-md-6">
              <label class="form-label">Loginserver Account</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver1.account"/>
              <small class="form-text text-muted">Used to authenticate your server as a registered server
                with the connecting loginserver (Not Required)
              </small>
            </div>

            <div class="form-group col-md-6">
              <label class="form-label">Loginserver Password</label>
              <div class="input-group">
                <input :type="passwordFieldType" class="form-control"
                       data-lpignore="true"
                       v-model="serverConfig.server.world.loginserver1.password"/>
                <span class="input-group-append">
                              <button class="btn btn-primary" type="button" @click="switchPasswordVisibility()"><i
                                class="fa fa-history pr-1"></i>
                                  Show / Hide
                              </button>
                            </span>
              </div>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Loginserver Host</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver1.host"/>
              <small class="form-text text-muted">Loginserver host your server is connecting to</small>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Loginserver Port</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver1.port"/>
              <small class="form-text text-muted">Loginserver port your server is connecting to (usually
                5998)
              </small>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Legacy Network Connection</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver1.legacy"/>
              <small class="form-text text-muted">Used to determine if this is a legacy network
                connection, needed for eqemulator.net
              </small>
            </div>
          </div>

          <hr>

          <h4>Connection #2</h4>

          <div class="form-row" v-if="serverConfig.server.world.loginserver2">
            <div class="form-group col-md-6">
              <label class="form-label">Loginserver Account</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver2.account"/>
              <small class="form-text text-muted">Used to authenticate your server as a registered server
                with the connecting loginserver (Not Required)
              </small>
            </div>

            <div class="form-group col-md-6">
              <label class="form-label">Loginserver Password</label>
              <div class="input-group">
                <input :type="passwordFieldType" class="form-control"
                       data-lpignore="true"
                       v-model="serverConfig.server.world.loginserver2.password"/>
                <span class="input-group-append">
                              <button class="btn btn-primary" type="button" @click="switchPasswordVisibility()"><i
                                class="fa fa-eye pr-1"></i>
                                  Show / Hide
                              </button>
                            </span>
              </div>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Loginserver Host</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver2.host"/>
              <small class="form-text text-muted">Loginserver host your server is connecting to</small>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Loginserver Port</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver2.port"/>
              <small class="form-text text-muted">Loginserver port your server is connecting to (usually
                5998)
              </small>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Legacy Network Connection</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver2.legacy"/>
              <small class="form-text text-muted">Used to determine if this is a legacy network
                connection, needed for eqemulator.net
              </small>
            </div>
          </div>

          <hr>

          <h4>Connection #3</h4>

          <div class="form-row" v-if="serverConfig.server.world.loginserver3">
            <div class="form-group col-md-6">
              <label class="form-label">Loginserver Account</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver3.account"/>
              <small class="form-text text-muted">Used to authenticate your server as a registered server
                with the connecting loginserver (Not Required)
              </small>
            </div>

            <div class="form-group col-md-6">
              <label class="form-label">Loginserver Password</label>
              <div class="input-group">
                <input :type="passwordFieldType" class="form-control"
                       v-model="serverConfig.server.world.loginserver3.password"/>
                <span class="input-group-append">
                              <button class="btn btn-primary" type="button" @click="switchPasswordVisibility()"><i
                                class="fa fa-eye pr-1"></i>
                                  Show / Hide
                              </button>
                            </span>
              </div>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Loginserver Host</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver3.host"/>
              <small class="form-text text-muted">Loginserver host your server is connecting to</small>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Loginserver Port</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver3.port"/>
              <small class="form-text text-muted">Loginserver port your server is connecting to (usually
                5998)
              </small>
            </div>

            <div class="form-group col-md-4">
              <label class="form-label">Legacy Network Connection</label>
              <input type="text" class="form-control"
                     v-model="serverConfig.server.world.loginserver3.legacy"/>
              <small class="form-text text-muted">Used to determine if this is a legacy network
                connection, needed for eqemulator.net
              </small>
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

      const loginServerConfigModel = {
        'account': '',
        'password': '',
        'legacy': '0',
        'host': '',
        'port': '5998'
      }

      if (typeof this.serverConfig.server.world.loginserver1 === 'undefined') {
        this.serverConfig.server.world.loginserver1 = loginServerConfigModel
      }

      if (typeof this.serverConfig.server.world.loginserver2 === 'undefined') {
        this.serverConfig.server.world.loginserver2 = loginServerConfigModel
      }

      if (typeof this.serverConfig.server.world.loginserver3 === 'undefined') {
        this.serverConfig.server.world.loginserver3 = loginServerConfigModel
      }

      this.loaded = true
    },
    methods: {
      submitServerConfig: async function () {
        const result = await EqemuAdminClient.postServerConfig(this.serverConfig)

        if (result.success) {
          this.$toast.info(result.success, 'Saved', {position: 'bottomRight'})
        }
      },
      generateRandomKey: function () {
        let result           = ''
        let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let charactersLength = characters.length
        for (var i = 0; i < 40; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }

        this.serverConfig.server.world.key = result
      },
      switchPasswordVisibility() {
        this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password'
      }
    }
  }
</script>
