<template>
  <div class="col-6 col-lg-3 col-xl">
    <div class="card">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col">

            <h6 class="text-uppercase text-muted mb-2">
              {{ name }}
            </h6>

            <span class="h2 mb-0">{{ counter }}</span>

          </div>
          <div class="col-auto">

            <!-- Icon -->
            <span :class="['h2', 'fe', 'fe-' + icon, 'text-muted', 'mb-0']"></span>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'DashboardCounter.vue',
    computed: {
      style () {
        return 'font-size: ' + this.counterFontSize
      }
    },
    props: {
      name: {
        default: '',
        required: true
      },
      counter: {
        default: 0,
        required: true
      },
      icon: {
        default: 'clock',
        required: true
      },
      counterFontSize: {
        type: String,
        required: false,
        default: '2rem'
      }
    }
  }
</script>
