<template>
  <div>
    <dashboard-navbar></dashboard-navbar>
    <div class="main-content">
      <div class="container content-area">
        <router-view></router-view>
      </div>
    </div>

    <dashboard-footer></dashboard-footer>
  </div>
</template>

<script lang="ts">
  import DashboardFooter from './Footer.vue'
  import DashboardHeader from './Header.vue'
  import DashboardNavbar from './Navbar.vue'

  export default {
    components: {
      DashboardFooter,
      DashboardHeader,
      DashboardNavbar
    }
  }
</script>
