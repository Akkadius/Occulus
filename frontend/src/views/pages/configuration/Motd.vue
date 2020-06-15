<template>
  <div>
    <div class="row justify-content-between align-items-center mb-5 mt-5">

      <div class="col-12 col-md-9 col-xl-7">
        <h2 class="mb-2">
          Message of the Day
        </h2>
        <p class="text-muted mb-md-0">
          Message of the day is what your players see when they first log in
        </p>
      </div>

      <div class="col-12 col-md-auto">
        <button type="submit" class="btn btn-primary ml-auto" @click="submit()">
          <i class="fe fe-save"></i>
          Save
        </button>
      </div>
    </div>

    <hr class="my-5">

    <div class="row justify-content-between align-items-center">
      <div class="col-lg-12">
        <div class="form-group">
          <textarea class="form-control" rows="7" v-model="motd"></textarea>
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
        motd: '',
        loaded: false
      }
    },
    async created() {
      const response = await EqemuAdminClient.getServerMotd()
      this.motd      = response.value
      this.loaded    = true
    },
    methods: {
      submit: async function () {
        const result = await EqemuAdminClient.postServerMotd({ motd: this.motd })

        if (result.success) {
          this.$toast.info(result.success, 'Saved', { position: 'bottomRight' })
        }
      }
    }
  }
</script>

<style scoped>

</style>
