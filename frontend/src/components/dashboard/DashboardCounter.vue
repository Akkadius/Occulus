<template>
  <div class="col-6 col-sm-4 col-lg-2">
    <div class="card" style="height:120px">
      <div class="card-body p-3 text-center">
        <div class="text-right text-red">
          &nbsp;
        </div>
        <div class="h1 m-0 accounts" :style="style">{{ counter }}</div>
        <div class="text-muted mb-4">{{ name }}</div>
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
      counterFontSize: {
        type: String,
        required: false,
        default: '2rem'
      }
    }
  }
</script>
