<script setup>

import { ref, onMounted } from "vue"

import Onboarding from "./components/Onboarding.vue"
import SearchScreen from "./components/SearchScreen.vue"
import Dashboard from "./components/Dashboard.vue"
import SettingsModal from "./components/SettingsModal.vue"

import { 
    getClientState,
    updateClientState
} from "./services/clientStateApi";

const loading = ref(true)

const onboarding = ref(true)

const currentScreen = ref("search")

const showSettings = ref(false)

async function checkState() {
  try {
    const state = await getClientState();

    onboarding.value = state.onboarding;
  } catch (error) {
    console.error("Failed loading state", error);
    
  }
  finally {
    loading.value = false;
  }
}

async function finishOnboarding() {
  await updateClientState({
    onboarding:false
  });

  onboarding.value = false;
}

function openDashboard()
{
    currentScreen.value = "dashboard"
}

onMounted(checkState);
</script>


<template>

<div v-if="loading">
    Loading Dossier...
</div>



<template v-else>

  <Onboarding 
      v-if="onboarding"
      @complete="finishOnboarding"
  />


  <SearchScreen
      v-if="!onboarding && currentScreen==='search'"
      @dashboard="openDashboard"
      @settings="showSettings=true"
  />


  <Dashboard
      v-if="currentScreen==='dashboard'"
  />


  <SettingsModal
      v-if="showSettings"
      @close="showSettings=false"
  />

</template>
</template>