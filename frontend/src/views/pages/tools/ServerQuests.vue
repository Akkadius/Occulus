<template>
  <div>
    <app-loader :is-loading="!(branches && currentBranch)"/>

    <div class="card" v-if="branches && currentBranch">
      <div class="card-body">

        <b-input-group prepend="Current Branch">
          <b-select v-model="currentBranch" :options="branches"/>
          <b-input-group-append>

            <b-button variant="primary" @click="setBranch">
              <i class="fa fa-dot-circle-o mr-2"></i>
              Set Branch
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
  name: 'ServerQuests',
  data() {
    return {
      currentBranch: null,
      branches: null,
      buildOutput: null
    }
  },
  async mounted() {
    this.loadBranches()
  },
  methods: {
    async loadBranches() {
      this.branches      = null
      this.currentBranch = null

      let r = await EqemuAdminClient.getServerQuestsBranches()
      if (r && r.status === 200) {
        const branchesResult = r.data

        let rcb = (await EqemuAdminClient.getServerQuestsBranch())
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
    async setBranch() {
      this.buildOutput = 'One moment...'
      const result = await EqemuAdminClient.setServerQuestsBranch(this.currentBranch);
      if (result.status === 200) {
        this.buildOutput = result.data
      }
    },
  }
}
</script>
