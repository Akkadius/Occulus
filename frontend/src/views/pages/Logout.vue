<template>
  <div></div>
</template>

<script>
  import { EqemuAdminClient } from '@/app/core/eqemu-admin-client'

  export default {
    name: 'Logout.vue',
    async created () {
      EqemuAdminClient.deleteAccessToken()
      this.$router.push({ path: '/login' })
    }
  }
</script>
