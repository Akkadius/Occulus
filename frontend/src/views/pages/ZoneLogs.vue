<template>
  <div class="col-12">
    <div class="row">
      <div class="col-lg-2 order-lg-0 mb-4" v-bind:style="{ height: panelHeight * 1.1 + 'px', overflowY: 'scroll' }">
        <div class="form-group">
          <div class="form-label">Logging Categories</div>
          <div class="custom-controls-stacked">
            <label class="custom-control custom-checkbox" v-for="(category, index) in logCategories"
                   :key="index">
              <input type="checkbox"
                     class="custom-control-input"
                     @change="updateCategoryLevel(category)"
                     v-model="category.log_to_console">

              <span class="custom-control-label">
              {{category.log_category_description}}
              ({{category.log_category_id}})
            </span>
            </label>
          </div>
        </div>
      </div>

      <div class="col-lg-10">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Logs</h3>
            <button type="submit" class="btn btn-primary ml-auto" @click="clearLogs()">
              <i class="fa fa-history pr-1"></i>
              Clear Logs
            </button>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-lg-12">
                <div class="form-group">
                <textarea class="form-control"
                          v-bind:style="{ fontSize: '1rem', height: panelHeight + 'px' }"
                          v-model="logData"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {EqemuWebsocketClient} from '@/app/core/eqemu-websocket-client'

  const LOG_STREAM_TRUNCATE_CHARACTER_LENGTH = 300000;

  export default {
    data() {
      return {
        logCategories: {},
        logData: '',
        zonePort: 0,
        zoneAttributes: null,
        wsEqemuClient: null,
        ws: null,
        panelHeight: 0
      }
    },
    async created() {
      this.panelHeight = window.innerHeight * .7
      this.zonePort    = this.$route.params.port

      /**
       * Setup client and fetch logging categories
       */
      this.wsEqemuClient = new EqemuWebsocketClient()
      this.ws = await this.wsEqemuClient.initClient(this.zonePort)
      this.wsEqemuClient.subscribeToLogging()
      this.wsEqemuClient.getLogCategories()

      /**
       * Message handling
       */
      let self = this

      this.ws.onmessage = function (event) {
        const response = JSON.parse(event.data)

        /**
         * Categories
         */
        if (response.method == self.wsEqemuClient.methods.GET_LOGSYS_CATEGORIES) {
          self.logCategories = response.data
          self.logCategories.sort(function (a, b) {
            const textA = a.log_category_description.toUpperCase()
            const textB = b.log_category_description.toUpperCase()
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
          })
        }

        if (response.method == self.wsEqemuClient.methods.GET_ZONE_ATTRIBUTES) {
          this.zoneAttributes = response.data
          console.log(this.zoneAttributes)
        }

        /**
         * Logging
         */
        if (response.event === self.wsEqemuClient.subscriptions.LOGGING) {
          const logString = self.logTimeStamp() + ' ' + response.data.msg + '\n' + self.logData
          self.logData    = logString.substring(0, LOG_STREAM_TRUNCATE_CHARACTER_LENGTH)
        }
      }
    },
    destroyed() {
      this.ws.close()
    },
    methods: {
      logTimeStamp: function () {
        const now    = new Date()
        const date   = [now.getMonth() + 1, now.getDate(), now.getFullYear()]
        const time   = [now.getHours(), now.getMinutes(), now.getSeconds()]
        const suffix = (time[0] < 12) ? 'AM' : 'PM'
        time[0]      = (time[0] < 12) ? time[0] : time[0] - 12
        time[0]      = time[0] || 12

        for (var i = 1; i < 3; i++) {
          if (time[i] < 10) {
            time[i] = '0' + time[i]
          }
        }

        return date.join('/') + ' ' + time.join(':') + ' ' + suffix
      },
      clearLogs: function () {
        this.logData = ''
      },
      updateCategoryLevel: function (category) {
        this.wsEqemuClient.setLoggingLevel(category.log_category_id, (category.log_to_console ? 3 : 0))
      }
    }
  }
</script>
