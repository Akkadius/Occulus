<template>
  <div class="col-12">
    <div class="header">
      <div class="header-body">
        <div class="row align-items-center">
          <div class="col">
            <h6 class="header-pretitle">
              Players Online
            </h6>

            <h1 class="header-title">
              Players Online Listing
            </h1>

          </div>
        </div>
      </div>
    </div>

    <players-online full-list="true"/>

  </div>
</template>

<script>
  import PlayersOnline from '../../components/PlayersOnline'

  export default {
    components: { PlayersOnline },
    data() {
      return {
      }
    },
  }
</script>
