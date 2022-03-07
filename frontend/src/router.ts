import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// @ts-ignore
export default new Router({
  mode: 'history',
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
  scrollBehavior(to, from, savedPosition) {
    // if title is passed
    if (to.meta && to.meta.title) {
      document.title = "[Occulus] " + to.meta.title || "Occulus"
    }

    // if link contains a hash target
    if (to.hash) {
      const hash = to.hash.replace("#", "");
      const hashTarget = document.getElementById(hash)
      if (hashTarget) {
        setTimeout(() => {
          hashTarget.scrollIntoView();
        }, 400);
        return null
      }
    }

    // otherwise resolve the state of location prior
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition)
        } else {
          resolve({x: 0, y: 0})
        }
      }, 400)
    })
  },
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
          component: () => import('./views/pages/Home.vue'),
          meta: {title: "Dashboard"},
        },
        {
          path: 'zoneservers',
          component: () => import('./views/pages/ZoneServers.vue'),
          meta: {title: "Zone Servers"},
        },
        {
          path: 'zoneservers/:port/netstats',
          component: () => import('./views/pages/Netstats.vue'),
          meta: {title: "Netstats"},
        },
        {
          path: 'zoneservers/:port/logs',
          component: () => import('./views/pages/ZoneLogs.vue'),
          meta: {title: "Zone Logs"},
        },
        {
          path: 'admin/configuration',
          component: () => import('./views/pages/configuration/Configuration.vue'),
          children: [
            {
              path: '/',
              component: () => import('./views/pages/configuration/WorldServerSettings.vue'),
              meta: {title: "World Server Settings"},
            },
            {
              path: 'settings/zoneserver',
              component: () => import('./views/pages/configuration/ZoneServerSettings.vue'),
              meta: {title: "Zone Server Settings"},
            },
            {
              path: 'settings/ucs',
              component: () => import('./views/pages/configuration/UcsSettings.vue'),
              meta: {title: "UCS Config"},
            },
            {
              path: 'settings/discord',
              component: () => import('./views/pages/configuration/DiscordSettings.vue'),
              meta: {title: "Discord Config"},
            },
            {
              path: 'settings/database',
              component: () => import('./views/pages/configuration/Database.vue'),
              meta: {title: "Database Config"},
            },
            {
              path: 'server-rules',
              component: () => import('./views/pages/configuration/ServerRules.vue'),
              meta: {title: "Server Rules"},
            },
            {
              path: 'motd',
              component: () => import('./views/pages/configuration/Motd.vue'),
              meta: {title: "Message of the Day"},
            }
          ]
        },
        {
          path: 'players-online',
          component: () => import('./views/pages/PlayersOnline.vue'),
          meta: {title: "Players Online"},
        },
        {
          path: 'tools',
          component: () => import('./views/pages/tools/Tools.vue'),
          children: [
            {
              path: 'logs',
              component: () => import('./views/pages/tools/Logs.vue'),
              meta: {title: "Server Logs"},
            },
            {
              path: 'backups',
              component: () => import('./views/pages/tools/Backups.vue'),
              meta: {title: "Backups"},
            },
            {
              path: 'server-code',
              component: () => import('./views/pages/tools/ServerCode.vue'),
              meta: {title: "Code Management"},
            },
            {
              path: 'server-quests',
              component: () => import('./views/pages/tools/ServerQuests.vue'),
              meta: {title: "Quests Management"},
            },
            {
              path: 'client-assets',
              component: () => import('./views/pages/tools/ClientAssets.vue'),
              meta: {title: "Client Asset Management"},
            },
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
