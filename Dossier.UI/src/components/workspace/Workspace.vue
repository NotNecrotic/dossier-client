<template>
  <div class="h-full w-full overflow-hidden bg-bg">
    <div
      v-if="serverReachable === false"
      class="absolute top-0 left-0 right-0 z-50 bg-red-500/10 border-b border-red-500/20 p-2 text-xs text-red-400 text-center"
    >
      Failed to load explorer tree.
    </div>

    <WelcomeWorkspace
      v-if="state === WorkspaceState.WELCOME && serverReachable === true"
    />

    <VideoWorkspace
      v-if="state === WorkspaceState.VIDEO"
      ref="videoWorkspaceRef"
      :video="video"
    />

    <!-- Future workspaces will be added here as switch cases -->
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { WorkspaceState, type VideoItem } from "./WorkspaceState";
import WelcomeWorkspace from "./WelcomeWorkspace.vue";
import VideoWorkspace from "./VideoWorkspace.vue";
import { serverReachable } from "../../api/explorer.ts";

const props = defineProps<{
  state: WorkspaceState;
  video: VideoItem | null;
  isLoading?: boolean;
}>();

const videoWorkspaceRef = ref<InstanceType<typeof VideoWorkspace> | null>(null);

function jumpTo(seconds: number) {
  videoWorkspaceRef.value?.jumpTo(seconds);
}

defineExpose({
  jumpTo,
});
</script>
