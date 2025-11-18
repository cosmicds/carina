<template>
  <v-dialog
    id="cds-privacy-policy"
    class="cds-privacy-policy__dialog"
    scrim="false"
    v-model="showPrivacyDialog"
    max-width="400px"
  >
    <v-card class="cds-privacy-policy__card">
      <div class="cds-privacy-policy__close">
        <v-btn 
          class="cds-privacy-policy__close-icon" 
          density="compact"
          icon="mdi-close"
          aria-label="Close privacy policy dialog"
          @click="showPrivacyDialog = false"
          @keyup.enter="showPrivacyDialog = false"
          />
      </div>
      <v-card-text class="cds-privacy-policy__text">
        <slot>
          <p>
            Your anonymous response will be used by the 
            <a 
              class="cds-privacy-policy__link"
              href="https://www.cosmicds.cfa.harvard.edu/" 
              rel="noopener noreferrer external" 
              target="_blank"
              >CosmicDS</a> team to improve the educational experience.
          </p>
          <p style="text-align: right; margin-top: 1em; font-size: 0.9em">
            <a 
            href="https://cfa.harvard.edu/privacy-statement" 
            rel="noopener noreferrer external" 
            target="_blank"
            >Privacy Policy</a>
          </p>
        </slot>
      </v-card-text>
      
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-empty-function */
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  mounted: () => {},
  data: () => {
    return {};
  },
  computed: {
    showPrivacyDialog:  {
      get: function () {
        return this.modelValue;
      },
      set: function (value: boolean) {
        this.$emit('update:model-value', value);
      }
    }
  },
  methods: {},
  watch: {},
});


</script>
<style lang="css">
#cds-privacy-policy {
  font-size: 0.9em;
}
.cds-privacy-policy__close {
  display: inline-flex;
  justify-content: flex-end;
  margin: 0 0 0 auto;
}
.cds-privacy-policy__close-icon {
  margin-top: 0.25em;
  margin-right: 0.25em;
}

#cds-privacy-policy.cds-privacy-policy__dialog .cds-privacy-policy__text {
  margin: 0;
  padding-top: 0;
}

.cds-privacy-policy__link {
  font-weight: normal;
}
</style>