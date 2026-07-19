<script setup>

import { ref, onMounted, watch } from "vue"

import Onboarding from "./components/Onboarding.vue"
import SearchScreen from "./components/SearchScreen.vue"
import Dashboard from "./components/Dashboard.vue"
import Settings from "./components/Settings.vue"
import { useSettings } from "./composables/useSettings";
import { getClientState, updateClientState } from "./services/clientStateApi";
import { ACCENTS } from "./constants/accents";

const loading = ref(true)
const onboarding = ref(true)
const currentScreen = ref("search")

const {
  settings,
  loadSettings
} = useSettings();

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

function setView(view) {
  currentScreen.value = (view)
}

async function finishOnboarding() {
  await updateClientState({
    onboarding: false
  });

  onboarding.value = false;

  setView('search')
}

watch(
  () => settings.value?.theme,
  (theme) => {
    if (!theme) return;

    document.documentElement.classList.remove(
      "theme-dark",
      "theme-light"
    );

    document.documentElement.classList.add(
      `theme-${theme}`
    );
  },
  { immediate: true }
);


watch(
  () => settings.value?.accent,
  (accent) => {
    if (!accent) return;

    const selected = ACCENTS[accent];

    if (!selected) return;

    document.documentElement.style.setProperty(
      "--accent-500",
      selected.main
    );

    document.documentElement.style.setProperty(
      "--accent-glow",
      selected.glow
    );
  },
  { immediate: true }
);

watch(
    [
        () => settings.value?.theme,
        () => settings.value?.accent
    ],
    ([theme, accent]) => {
        if (!theme || !accent)
            return;

        const image = `../src/assets/backgrounds/${theme}-${accent.toLowerCase()}.png`;

        document.documentElement.style.setProperty(
            "--background-image",
            `url("${image}")`
        );
    },
    {
        immediate: true
    }
);

onMounted(async () => {
  await loadSettings();
  checkState();
});
</script>

<template>
  <div v-if="loading">Loading Dossier...</div>

  <template v-else>

    <Onboarding v-if="onboarding" @complete="finishOnboarding" />

    <SearchScreen v-if="currentScreen === 'search'" @dashboard="setView('dashboard')" @settings="setView('settings')" />

    <Dashboard v-if="currentScreen === 'dashboard'" />

    <Settings v-if="currentScreen === 'settings'" :setView="setView" @close="setView('search')" />

  </template>
</template>