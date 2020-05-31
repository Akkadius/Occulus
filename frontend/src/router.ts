import Vue    from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
  routes: [
    {
      path: '/',
      meta: {
        title: 'EQEmu Admin Panel'
      },
      component: () => import('./views/dashboard/Layout.vue'),
      children: [
        {
          path: '/',
          component: () => import('./views/pages/Home.vue')
        },
        {
          path: 'zoneservers',
          component: () => import('./views/pages/ZoneServers.vue')
        },
        {
          path: 'zoneservers/:port/netstats',
          component: () => import('./views/pages/Netstats.vue')
        },
        {
          path: 'zoneservers/:port/logs',
          component: () => import('./views/pages/ZoneLogs.vue')
        },
        {
          path: 'admin/configuration',
          component: () => import('./views/pages/configuration/Configuration.vue'),
          children: [
            {
              path: '/',
              component: () => import('./views/pages/configuration/WorldServerSettings.vue')
            },
            {
              path: 'settings/zoneserver',
              component: () => import('./views/pages/configuration/ZoneServerSettings.vue')
            },
            {
              path: 'settings/ucs',
              component: () => import('./views/pages/configuration/UcsSettings.vue')
            },
            {
              path: 'settings/database',
              component: () => import('./views/pages/configuration/Database.vue')
            },
            {
              path: 'server-rules',
              component: () => import('./views/pages/configuration/ServerRules.vue')
            },
            {
              path: 'motd',
              component: () => import('./views/pages/configuration/Motd.vue')
            }
          ]
        },
        {
          path: 'players-online',
          component: () => import('./views/pages/PlayersOnline.vue'),
        },
        {
          path: 'admin/tools',
          component: () => import('./views/pages/tools/Tools.vue'),
          children: [
            {
              path: '/',
              component: () => import('./views/pages/tools/Backups.vue')
            },
            {
              path: 'client/assets',
              component: () => import('./views/pages/tools/ClientAssets.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/logout',
      component: () => import('./views/pages/Logout.vue')
    },
    {
      path: '/login',
      component: () => import('./views/pages/Login.vue')
    }
  ]
})
