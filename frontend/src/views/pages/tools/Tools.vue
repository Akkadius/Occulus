<template>
  <div class="col-12">
    <div class="header">
      <div class="header-body">
        <div class="row align-items-center">
          <div class="col">
            <h6 class="header-pretitle">
              Server Tools
            </h6>

            <h1 class="header-title">
              Tools
            </h1>
          </div>
        </div>
        <div class="row align-items-center">
          <div class="col">

            <ul class="nav nav-tabs nav-overflow header-tabs">
              <li class="nav-item">
                <router-link
                  :to="ROUTES.TOOLS_LOGS"
                  active-class=""
                  exact-active-class="active"
                  :class="'nav-link ' + (hasRoute(ROUTES.TOOLS_LOGS) ? 'active' : '')"
                >
                  <i class="fe fe-book mr-2"></i>
                  Logs
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                  :to="ROUTES.TOOLS_SERVER_CODE"
                  active-class=""
                  exact-active-class="active"
                  class="nav-link">
                  <i class="fa fa-code-fork mr-2"></i>
                  Server Code (Linux)
                </router-link>
              </li>


              <li class="nav-item">
                <router-link
                  :to="ROUTES.TOOLS_QUESTS"
                  active-class=""
                  exact-active-class="active"
                  class="nav-link">
                  <i class="fa fa-code-fork mr-2"></i>
                  Quests
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                  :to="ROUTES.TOOLS_BACKUPS"
                  active-class=""
                  exact-active-class="active"
                  class="nav-link"
                >
                  <i class="fe fe-download-cloud mr-2"></i>
                  Manual Backup
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                  :to="ROUTES.TOOLS_CLIENT_ASSETS"
                  active-class=""
                  exact-active-class="active"
                  class="nav-link"
                >
                  <span class="icon mr-3"><i class="fa fa-th"></i></span>
                  Client Assets
                </router-link>
              </li>

            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-12">
        <router-view></router-view>
      </div>
    </div>

  </div>
</template>

<script>
import {ROUTES} from "@/routes";

export default {
  name: 'Tools',
  data() {
    return {
      ROUTES: ROUTES
    }
  },
  methods: {
    hasRoute: function (partial) {
      return (this.$route.path.indexOf(partial) > -1)
    },
  }
}
</script>
