<template>
  <div
    class="search grid grid-cols-[320px_minmax(0,1fr)_360px] h-screen w-screen"
  >
    <!-- FILE EXPLORER -->
    <FileExplorer @select-video="selectVideo" />

    <!-- VIDEO PLAYER -->
    <VideoPlayer ref="videoPlayer" :video="currentVideo" />

    <!-- AI CHAT -->
    <ChatPanel
      :search-result="props.searchResult"
      @video-requested="handleVideoRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import FileExplorer from "./FileExplorer.vue";
import VideoPlayer from "./VideoPlayer.vue";
import ChatPanel from "./ChatPanel.vue";

interface VideoItem {
  id: string;
  name: string;
  path: string;
  type: "file";
  status?: string;
}

interface QueryKeypoint {
  fingerprint: string;
  start: number;
  end: number;
  text: string;
  reason: string;
  filePath: string;
}

interface QueryResponse {
  answer: string;
  keypoints: QueryKeypoint[];
}

interface VideoPlayerExpose {
  jumpTo(seconds: number): void;
}

const props = defineProps<{
  searchResult: QueryResponse | null;
}>();

const currentVideo = ref<VideoItem | null>(null);

const videoPlayer = ref<VideoPlayerExpose | null>(null);

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
    videoPlayer.value?.jumpTo(point.start);
  }, 500);
}
</script>
