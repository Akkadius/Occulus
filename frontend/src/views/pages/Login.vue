<template>
  <div class="d-flex align-items-center bg-auth border-top border-top-2 border-primary">

    <!-- CONTENT
    ================================================== -->
    <div class="container-fluid">
      <div class="row align-items-center justify-content-center">
        <div class="col-12 col-md-5 col-lg-6 col-xl-4 px-lg-6 my-5">

          <!-- Heading -->
          <h1 class="display-4 text-center mb-6 menuetto-header">
            Occulus
            <span style="display:block; font-size: 38px">EverQuest Emulator Admin Panel</span>
          </h1>

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
            <button
              type="button"
              class="btn btn-primary btn-block"
              @click="login()">
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
        <div class="col-12 col-md-7 col-lg-6 col-xl-8 d-none d-lg-block">
          <!-- Image -->
          <div class="bg-cover vh-100 mt-n1 mr-n3"
               :style="{ backgroundImage: 'url(' + require('@/assets/img/covers/gate-side.png') + ')'}">

            <div class="c" v-for="index in 150"></div>

          </div>

        </div>
      </div> <!-- / .row -->
    </div>
  </div>
</template>

<style lang="scss">

  @function posOrNeg() {
    @return random() * 2 - 1;
  }


  $total: 200;
  $size: 30;

  .c {
    position: absolute;
    width: $size+px;
    height: $size+px;
    margin-top: -$size/2+px;
    margin-left: -$size/2+px;
    transform: translate3d(50vw, 50vh, -1000px);
    border-radius: 50%;
    border-width: 0;
    opacity: .1;
  }

  @for $i from 1 through $total {
    $color: hsl(($i * .1)+210, 60%, 61%);

    .c:nth-child(#{$i}) {
      animation: anim#{$i} 6.0s infinite alternate;
      animation-delay: $i * -1s;
      background: $color;
      background: radial-gradient(circle at top left, lighten($color, 10%), $color);
      box-shadow: 0 0 25px 3px lighten($color, 5%);
      border: 0 solid $color;
    }
    @keyframes anim#{$i}{
      80% {
        opacity: .8;
      }
      100% {
        transform: translate3d(random(100)+vw, random(100)+vh, 0);
        opacity: .1;
      }
    }
  }
</style>

<script>
  import {EqemuAdminClient} from '@/app/core/eqemu-admin-client'

  export default {
    name: 'Login.vue',
    data() {
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
