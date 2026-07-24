<template>
  <div
    class="search grid grid-cols-[320px_minmax(0,1fr)_360px] h-screen w-screen"
  >
    <!-- FILE EXPLORER -->
    <FileExplorer
      @select-video="selectVideo"
      @loading-change="(loading) => (isExplorerLoading = loading)"
    />

    <!-- DOSSIER WORKSPACE -->
    <Workspace
      ref="workspaceRef"
      :state="workspaceState"
      :video="currentVideo"
      :is-loading="isExplorerLoading"
    />

    <!-- AI CHAT -->
    <ChatPanel
      :search-result="props.searchResult"
      @video-requested="handleVideoRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { QueryKeypoint, QueryResponse } from "./workspace/WorkspaceState";
import { WorkspaceState } from "./workspace/WorkspaceState";

import FileExplorer from "./FileExplorer.vue";
import Workspace from "./workspace/Workspace.vue";
import ChatPanel from "./ChatPanel.vue";

interface VideoItem {
  id: string;
  name: string;
  path: string;
  type: "file";
  status?: string;
}

interface WorkspaceExpose {
  jumpTo(seconds: number): void;
}

const props = defineProps<{
  searchResult: QueryResponse | null;
}>();

const currentVideo = ref<VideoItem | null>(null);

const workspaceState = computed(() =>
  currentVideo.value ? WorkspaceState.VIDEO : WorkspaceState.WELCOME,
);

const workspaceRef = ref<WorkspaceExpose | null>(null);

const isExplorerLoading = ref(true);

function selectVideo(video: VideoItem) {
  currentVideo.value = video;
}

function handleVideoRequest(point: QueryKeypoint) {
  console.log("Jump request:", point);

  if (!point.filePath) {
    console.error("No filepath in keypoint");
    return;
  }

  const video: VideoItem = {
    id: point.fingerprint,
    name: point.filePath.split("\\").pop() ?? point.filePath,
    path: point.filePath,
    type: "file",
  };

  currentVideo.value = video;

  setTimeout(() => {
    workspaceRef.value?.jumpTo(point.start);
  }, 500);
}
</script>
