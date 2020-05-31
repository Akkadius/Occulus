import Vue from 'vue'
import router from './router'
import App from './App.vue'
import store from './store'
import BootstrapVue from 'bootstrap-vue'

/**
 * Bootstrap
 */
// import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@/assets/css/custom.css'

/**
 * iziToast
 */
import VueIziToast from 'vue-izitoast'

import 'izitoast/dist/css/iziToast.css'
Vue.use(BootstrapVue)

/**
 * Dashkit Theme Assets
 */
import './assets/css/theme.min.css'
import './assets/fonts/feather/feather.min.css'

Vue.use(VueIziToast)

/**
 * App loader
 */
Vue.component('app-loader', () => import('@/components/LoaderComponent.vue'));

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
