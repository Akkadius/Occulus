<template>
    <router-view></router-view>
</template>

<script>

import {ROUTES} from "@/routes";

export default {
  name: 'example',
  data () {
    return {}
  },
  mounted () {
    var self = this
    window.addEventListener('keypress', function (e) {
      if (e.srcElement.tagName !== 'BODY' && e.srcElement.tagName !== 'A') {
        return
      }

      if (window.location.pathname === '/login') {
        return
      }

      switch (String.fromCharCode(e.keyCode)) {
        case 'd':
          toggleDarkMode()
          break
        case '1':
          self.$router.push(ROUTES.ROOT)
          break
        case '2':
          self.$router.push(ROUTES.PLAYERS_ONLINE)
          break
        case '3':
          self.$router.push(ROUTES.ZONESERVERS)
          break
        case '4':
          self.$router.push(ROUTES.CONFIGURATION)
          break
        case '5':
          self.$router.push(ROUTES.TOOLS_LOGS)
          break
        case 'p':
          self.$root.$emit('bv::show::modal', 'start-server-modal')
          break
        case 'r':
          self.$root.$emit('bv::show::modal', 'restart-server-modal')
          break
        case 'c':
          self.$root.$emit('bv::show::modal', 'cancel-restart-server-modal')
          break
        case 's':
          self.$root.$emit('bv::show::modal', 'stop-server-modal')
          break
      }
    })
  }
}
</script>
