<template>
  <div class="h-full w-full overflow-hidden bg-bg">
    <WelcomeWorkspace v-if="state === WorkspaceState.WELCOME" />

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

const props = defineProps<{
  state: WorkspaceState;
  video: VideoItem | null;
}>();

const videoWorkspaceRef = ref<InstanceType<typeof VideoWorkspace> | null>(null);

function jumpTo(seconds: number) {
  videoWorkspaceRef.value?.jumpTo(seconds);
}

defineExpose({
  jumpTo,
});
</script>
