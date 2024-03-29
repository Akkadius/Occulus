<template>
  <div class="col-12">
    <div class="header">
      <div class="header-body">
        <div class="row align-items-center">
          <div class="col">
            <h6 class="header-pretitle">
              Zone Servers
            </h6>

            <h1 class="header-title">
              Zone Server Listing
            </h1>

          </div>
        </div>
      </div>
    </div>

    <app-loader :is-loading="!loaded"></app-loader>

    <span v-if="zoneList.length === 0 && loaded">Zoneservers are offline</span>

    <div
      :class="['card', 'mb-3']"
      v-for="zone in zoneList"
      v-if="processStats[zone.zone_os_pid]"
    >
      <div :class="['card-body', 'lift', 'btn-default']" style="box-shadow: 0 2px 4px 0 rgba(30,55,90,.1);">
        <div class="row align-items-center">

          <div class="col ml-n1">
            <h4 class="mb-1">

              <span class="h2 fe text-muted mb-0 fe-layers mr-3"></span>

              <router-link
                :to="'/deployment/'"
                style="color:#2364d2;font-weight:200;font-size: 18px;"
                v-if="zone.zone_long_name"
              >
                {{ (zone.zone_long_name ? zone.zone_long_name : 'Standby Zone') }}
              </router-link>

              <span style="color:#666;font-weight:200;font-size: 18px;" class="text-muted" v-if="!zone.zone_long_name">
                Ready for players...
              </span>

              <div class="mt-2" v-if="zone.zone_long_name">
                <div class="connector"></div>
                <a class="avatar-xs" data-toggle="tooltip" title="" data-original-title="Created by">
                  <img
                    src="~@/assets/img/eqemu-avatar.png"
                    style="height:20px;width:20px; border: 1px solid #666;"
                    class="avatar-img rounded-circle ml-2"
                  >
                </a>
                <span class="text-muted ml-2" style="font-size:12px">
                  {{ zone.is_static_zone === true ? 'Static' : 'Dynamic' }}
                  {{ zone.zone_name }}
                  ({{ zone.zone_id }})
                  <span v-if="zone.instance_id">Instance: {{ zone.instance_id }}</span>
                </span>
                <span class="text-muted ml-2" style="font-size:12px">  </span>
                <router-link
                  class="text-muted ml-2"
                  :to="`zoneservers/${zone.client_port}/logs`"
                  style="font-size:12px"
                >
                  <i class="fe fe-play"></i> Stream Logs
                </router-link>
              </div>

            </h4>
          </div>

          <div class="col-auto">
            <p class="card-text small text-muted mb-1 mt-2">
              <i class="fe fe-proc"></i> PID {{ zone.zone_os_pid }}
            </p>
          </div>

          <div class="col-auto">
            <p class="card-text small text-muted mb-1 mt-2">
              <i class="fe fe-cloud"></i> Port {{ zone.client_port }}
            </p>
          </div>


          <div class="col-auto">
            <p class="card-text small text-muted mb-1 mt-2">
              <i class="fe fe-users"></i> {{ zone.number_players }}
            </p>
          </div>

          <div class="col-auto">
            <p class="card-text small text-muted mb-1 mt-2" v-if="processStats[zone.zone_os_pid]">
              <i class="fe fe-cpu"></i> {{ parseFloat(processStats[zone.zone_os_pid].cpu / 100).toFixed(2) }} %
            </p>
          </div>

          <div class="col-auto">
            <p class="card-text small text-muted mb-1 mt-2" v-if="processStats[zone.zone_os_pid]">
              {{ parseFloat(processStats[zone.zone_os_pid].memory / 1024 / 1024).toFixed(2) }}MB
            </p>
          </div>

          <div class="col-auto">
            <p class="card-text small text-muted mb-1 mt-2" v-if="processStats[zone.zone_os_pid]">
              <i class="fe fe-clock"></i>
              {{ parseFloat(processStats[zone.zone_os_pid].elapsed / 1000 / 60 / 60).toFixed(2) }}h
            </p>
          </div>

          <div class="col-auto">
            <a
              class="text-muted"
              href="javascript:void(0)"
              @click="killZone(zone.zone_os_pid)"
              style="font-size:12px"
            >
              <i class="fa fa-power-off"></i> Kill Zone
            </a>
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
      zoneList: [],
      processStats: {},
      loaded: false,
      zoneServerLoop: null,
      chartLoaded: false
    }
  },
  async created() {
    let self = this
    this.getZoneList()
    this.zoneServerLoop = setInterval(function () {
      if (!document.hidden) {
        self.getZoneList()
      }
    }, 1000)
  },
  methods: {
    async killZone(pid) {
      if (confirm("Are you sure that you want to kill this process pid (" + pid + ")?")) {
        await EqemuAdminClient.killProcessByPid(pid)
        this.zoneList = []
        this.getZoneList()
      }
    },
    async getZoneList() {
      const zoneList = await EqemuAdminClient.getZoneList()
      this.loaded    = true
      if (zoneList !== null && zoneList.zone_list !== null && Object.keys(zoneList).length > 0 && Object.keys(zoneList.process_stats).length > 0) {
        this.zoneList     = zoneList.zone_list
        this.processStats = zoneList.process_stats
      }
    }
  },
  destroyed() {
    clearInterval(this.zoneServerLoop)
  },
}
</script>

<style>
.avatar-image {
  background-image: url('~@/assets/img/eqemu-avatar.png');
}

.connector {
  width: 15px;
  height: 15px;
  opacity: .2;
  border-bottom-left-radius: 8px;
  border-left: 1px solid #1e375a;
  border-bottom: 1px solid #1e375a;
  margin-left: 9px;
  display: inline-flex;
}

.image-label {
  background-color: rgba(35, 100, 210, .07);
  color: #2364d2;
  padding: 0 4px;
  border-radius: 2px;
}
</style>
