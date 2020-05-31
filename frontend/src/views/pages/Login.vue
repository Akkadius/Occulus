<template>
  <div class="page">
    <div class="page-single">
      <div class="container">
        <div class="row">
          <div class="col col-login mx-auto">

            <form class="card login-form" action="" method="post">
              <div class="card-body p-6">
                <div class="card-title">Login</div>

                <!-- Username -->
                <div class="form-group">

                  <label class="form-label">
                    Username
                  </label>

                  <input
                    type="text"
                    class="form-control"
                    name="username"
                    aria-describedby="username"
                    placeholder="Enter username"
                    @keydown="$event.keyCode === 13 ? login() : false"
                    v-model="username">
                </div>

                <!-- Password -->
                <div class="form-group">

                  <label class="form-label">
                    Password
                  </label>

                  <input type="password"
                         class="form-control"
                         name="password"
                         v-model="password"
                         @keydown="$event.keyCode === 13 ? login() : false"
                         placeholder="Password">
                </div>

                <div class="form-footer">
                  <button type="button" class="btn btn-primary btn-block" @click="login()">
                    Sign in
                  </button>
                </div>

                <app-loader :is-loading="!loaded"></app-loader>

                <div class="alert alert-danger mt-5"
                     role="alert"
                     v-show="errorMessage && loaded">
                  {{ errorMessage }}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { EqemuAdminClient } from '@/app/core/eqemu-admin-client'

  export default {
    name: 'Login.vue',
    data () {
      return {
        username: '',
        password: '',
        errorMessage: '',
        loaded: true
      }
    },
    methods: {
      login: async function () {
        this.loaded       = false
        this.errorMessage = ''

        const result = await EqemuAdminClient.login(
          {
            username: this.username,
            password: this.password
          }
        )

        console.log(result)

        this.loaded = true
        if (result && result.success) {
          if (result.access_token) {
            EqemuAdminClient.storeAccessToken(result.access_token)
          }

          this.$router.push({ path: '/' })
        } else if (result.error) {
          this.errorMessage = result.error
        }
      }
    }
  }
</script>
