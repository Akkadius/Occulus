<template>
  <div class="col-12">
    <div class="header mb-0">
      <div class="header-body">
        <div class="row align-items-center">
          <div class="col">

            <!-- Pretitle -->
            <h6 class="header-pretitle">
              Admin
            </h6>

            <!-- Title -->
            <h1 class="header-title">
              Configuration
            </h1>

          </div>
        </div> <!-- / .row -->
        <div class="row align-items-center mt-5">
          <div class="col">

            <!-- Nav -->
            <ul class="nav nav-tabs nav-overflow header-tabs nav-fill">
              <li class="nav-item">
                <router-link
                  to="/admin/configuration"
                  active-class=""
                  exact-active-class="active"
                  class="nav-link">
                  <span class="icon mr-1"><i class="fe fe-globe"></i></span>
                  World Server
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                  to="/admin/configuration/settings/zoneserver"
                  active-class=""
                  exact-active-class="active"
                  class="nav-link">
                  <span class="icon mr-1"><i class="fe fe-box"></i></span>
                  Zone Server
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                  to="/admin/configuration/settings/ucs"
                  active-class=""
                  exact-active-class="active"
                  class="nav-link">
                  <span class="icon mr-1"><i class="fe fe-users"></i></span>
                  Universal Chat Service
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                  to="/admin/configuration/settings/database"
                  active-class=""
                  exact-active-class="active"
                  class="nav-link">
                  <span class="icon mr-1"><i class="fe fe-database"></i></span>
                  Database
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                  to="/admin/configuration/motd"
                  active-class=""
                  exact-active-class="active"
                  class="nav-link">
                  <span class="icon mr-1"><i class="fe fe-bell"></i></span>
                  MOTD
                </router-link>
              </li>

              <li class="nav-item">
                <router-link
                  to="/admin/configuration/server-rules"
                  active-class=""
                  exact-active-class="active"
                  class="nav-link">
                  <span class="icon mr-1"><i class="fe fe-settings"></i></span>
                  Rules
                </router-link>
              </li>
            </ul>

          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-12">
        <router-view></router-view>
      </div>
    </div>

  </div>
</template>
