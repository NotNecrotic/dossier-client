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

const onboardingComplete = ref(false)

const currentScreen = ref("search")

const showSettings = ref(false)

async function checkState() {
  try {
    const state = await getClientState();

    onboardingComplete.value = state.Onboarding;
  } catch (error) {
    console.error("Failed loading state", error);
    
  }
  finally {
    loading.value = false;
  }
}

async function finishOnboarding() {
  await updateClientState({
    Onboarding:true
  }),

  onboardingComplete.value = true;
}

function openDashboard()
{
    currentScreen.value = "dashboard"
}

onMounted(checkState);
</script>


<template>


<Onboarding 
    v-if="!onboardingComplete"
    @complete="finishOnboarding"
/>


<SearchScreen
    v-if="!showOnboarding && currentScreen==='search'"
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