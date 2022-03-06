<template>
  <div>
    <app-loader :is-loading="!(branches && currentBranch)"/>

    <div class="card" v-if="branches && currentBranch">
      <div class="card-body">

        <b-input-group prepend="Current Branch">
          <b-select v-model="currentBranch" :options="branches"/>
          <b-input-group-append>

            <b-button variant="primary" @click="buildCode">
              <i class="fa fa-wrench mr-2"></i>
              Build!
            </b-button>

            <b-button variant="danger" @click="cancelBuild">
              <i class="fe fe-stop-circle"></i>
              Cancel
            </b-button>

          </b-input-group-append>
        </b-input-group>
      </div>

      <div class="card-footer bg-dark pb-0" v-if="buildOutput">
        <pre
          id="build-output" class="highlight html bg-dark hljs xml mb-0"
          style="color: #569CD6; max-height: 600px; overflow-y: scroll"
        >
{{ buildOutput }}
        </pre>
      </div>

    </div>
  </div>
</template>

<script>
import {EqemuAdminClient} from "@/app/core/eqemu-admin-client";
import Timer              from "@/app/core/timer";

export default {
  name: 'ServerCode',
  data() {
    return {
      currentBranch: null,
      branches: null,
      buildOutput: null
    }
  },
  async mounted() {
    this.loadBranches()
    this.watchServerBuild()
  },
  beforeDestroy() {
    clearInterval(Timer.timer['code-build-update-interval'])
  },
  methods: {
    async loadBranches() {
      this.branches      = null
      this.currentBranch = null

      let r = await EqemuAdminClient.getServerCodeBranches()
      if (r && r.status === 200) {
        const branchesResult = r.data

        let rcb = (await EqemuAdminClient.getServerCodeBranch())
        if (rcb && rcb.status === 200) {
          const currentBranch = rcb.data.trim()
          this.currentBranch  = currentBranch

          let branchOptions = [];
          branchesResult.branches.forEach((branch) => {
            let option = {};

            option.text  = branch + (currentBranch === branch ? ' (Current)' : '');
            option.value = branch;

            branchOptions.push(option);
          })

          this.branches = branchOptions;
        }
      }
    },
    async buildCode() {
      this.buildOutput = 'Building...'
      await EqemuAdminClient.setServerCodeBranch(this.currentBranch);
      await EqemuAdminClient.updateServerCode();
      EqemuAdminClient.buildServerCode();
      this.watchServerBuild()
    },

    watchServerBuild() {
      if (Timer.timer['code-build-update-interval']) {
        clearInterval(Timer.timer['code-build-update-interval'])
      }

      Timer.timer['code-build-update-interval'] = setInterval(async () => {
        let r = (await EqemuAdminClient.getBuildStatus())
        if (r && r.status === 200) {
          this.buildOutput = r.data.log
        }

        let element = document.getElementById("build-output");
        if (element) {
          element.scrollTop = element.scrollHeight + 500;
        }
      }, 500);
    },

    async cancelBuild() {
      await EqemuAdminClient.cancelServerBuild()
      this.buildOutput = 'Build cancelled'
      clearInterval(Timer.timer['code-build-update-interval'])
    }
  }
}
</script>
