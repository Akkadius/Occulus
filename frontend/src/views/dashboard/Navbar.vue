<template>
  <nav class="navbar navbar-expand-lg navbar-dark" id="topnav">
    <div class="container">

      <!-- Toggler -->
      <button class="navbar-toggler mr-auto" type="button" data-toggle="collapse" data-target="#navbar"
              aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Collapse -->
      <div class="collapse navbar-collapse mr-auto order-lg-first" id="navbar">

        <img src="http://www.projecteq.net/forums/styles/ProjectEQ.png" style="height:40px"
             class="mr-3 align-content-center">

        <!-- Navigation -->
        <ul class="navbar-nav mr-auto">

          <!-- Dashboard -->
          <li class="nav-item dropdown">
            <router-link class="nav-link" to="/" exact>
              <i class="fe fe-home"></i> Dashboard
            </router-link>
          </li>

          <!-- Players Online -->
          <li class="nav-item dropdown">
            <router-link to="/players-online" class="nav-link">
              <i class="fe fe-user"></i> Players Online
            </router-link>
          </li>

          <!-- Zone Servers -->
          <li class="nav-item dropdown">
            <router-link to="/zoneservers" class="nav-link">
              <i class="fe fe-box"></i> Zone Servers
            </router-link>
          </li>

          <!-- Configuration -->
          <li class="nav-item dropdown">
            <router-link to="/admin/configuration" class="nav-link">
              <i class="fe fe-settings"></i> Configuration
            </router-link>
          </li>

          <!-- Tools -->
          <li class="nav-item dropdown">
            <router-link :to="ROUTES.TOOLS" class="nav-link">
              <i class="fa fa-wrench mr-2"></i> Tools
            </router-link>
          </li>

        </ul>
      </div>

      <div class="navbar-user">

        <!-- Dropdown -->
        <div class="dropdown">

          <!-- Toggle -->
          <a href="#" class="avatar avatar-sm avatar-online dropdown-toggle" role="button" data-toggle="dropdown"
             aria-haspopup="true" aria-expanded="false">
            <img alt="..." src="~@/assets/img/eqemu-avatar.png" class="avatar-img rounded-circle">
          </a>

          <!-- Menu -->
          <div class="dropdown-menu dropdown-menu-right">
            <router-link class="dropdown-item" to="/logout">Logout</router-link>
          </div>

        </div>

      </div>

    </div>



  </nav>
</template>

<script>

  import {EqemuAdminClient}    from "@/app/core/eqemu-admin-client";
  import ServerProcessEventBus from '@/app/core/bus/server-process-bus'
  import {ROUTES}              from "@/routes";

  export default {
    components: {
      LauncherOptions: () => import ('@/components/server/LauncherOptions.vue')
    },
    data() {
      return {
        username: null,
        launcher: null,
        delayedRestart: 0,

        ROUTES: ROUTES,
      }
    },

    async mounted() {
      const result  = await EqemuAdminClient.getLauncherConfig();
      this.launcher = result.data;
    },

    methods: {
      hasRoute: function (partial) {
        return (this.$route.path.indexOf(partial) > -1)
      },

    },
    async created() {
      const accessTokenUserInfo = await EqemuAdminClient.getAccessTokenUserInfo()
      // this.username             = accessTokenUserInfo.user
    }
  }
</script>

<style scoped>
  .navbar-nav .nav-link > .fe {
    min-width: 1.25rem;
  }

</style>
