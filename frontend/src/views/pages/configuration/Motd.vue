<template>
  <div class="card">

    <div class="card-header">
      <h4 class="card-header-title">Message of the Day</h4>
    </div>

    <div class="card-body">

      <app-loader :is-loading="!loaded"></app-loader>

      <!-- Row -->
      <div class="row">
        <div class="col-lg-12">
          <div class="form-group">
            <label class="form-label">Message of the Day</label>
            <textarea class="form-control" rows="7" v-model="motd"></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Buttons -->
    <div class="card-footer text-right">
      <div class="d-flex">
        <button type="submit" class="btn btn-primary ml-auto" @click="submit()">Save</button>
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
        const result = await EqemuAdminClient.postServerMotd({motd: this.motd})

        if (result.success) {
          this.$toast.info(result.success, 'Saved', {position: 'bottomRight'})
        }
      }
    }
  }
</script>

<style scoped>

</style>
