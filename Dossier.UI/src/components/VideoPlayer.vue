<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from "vue";

const API = "http://127.0.0.1:5187";

interface ExplorerVideo {
  id: string;
  name: string;
  path: string;
  type: "file";
  status?: string;
}

const props = defineProps<{
  video: ExplorerVideo | null;
}>();

const video = computed(() => props.video);

const videoPlayer = ref<HTMLVideoElement | null>(null);

const activeSubtitle = ref("");

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

const subtitles = ref<Subtitle[]>([]);

watch(video, async (newVideo) => {
  if (newVideo) {
    await nextTick();

    loadVideo(newVideo);
  }
});

async function loadVideo(video: ExplorerVideo) {
  await nextTick();

  if (!videoPlayer.value) return;

  const url = `${API}/api/video?path=${encodeURIComponent(video.path)}`;

  console.log("Loading:", url);

  videoPlayer.value.src = url;

  videoPlayer.value.load();

  videoPlayer.value.onloadedmetadata = () => {
    console.log("Metadata loaded", {
      duration: videoPlayer.value?.duration,

      width: videoPlayer.value?.videoWidth,

      height: videoPlayer.value?.videoHeight,
    });
  };

  videoPlayer.value.oncanplay = () => {
    console.log("Can play");
  };

  videoPlayer.value
    .play()
    .then(() => {
      console.log("Playing");
    })
    .catch((err) => {
      console.error("Play failed:", err);
    });

  videoPlayer.value.onerror = () => {
    console.error(videoPlayer.value?.error);
  };
}

function jumpTo(seconds: number) {
  if (!videoPlayer.value) {
    console.error("Video element missing");

    return;
  }

  const video = videoPlayer.value;

  const seek = () => {
    console.log("Jumping to:", seconds);

    video.currentTime = seconds;

    video.play().catch((err) => {
      console.error("Seek play failed:", err);
    });
  };

  if (video.readyState >= 1) {
    seek();
  } else {
    console.log("Waiting for metadata...");

    video.addEventListener("loadedmetadata", seek, {
      once: true,
    });
  }
}

defineExpose({
  jumpTo,
});

function parseSubtitles(text: string): Subtitle[] {
  const blocks = text.split(/\n\n+/);

  return blocks
    .map((block) => {
      const lines = block.split("\n");

      if (lines.length < 2) return null;

      const times = lines[0].split("-->");

      if (times.length !== 2) return null;

      return {
        start: timestampToSeconds(times[0].trim()),

        end: timestampToSeconds(times[1].trim()),

        text: lines.slice(1).join("\n"),
      };
    })
    .filter((x): x is Subtitle => x !== null);
}

function timestampToSeconds(value: string) {
  const parts = value.replace(",", ".").split(":").map(Number);

  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

onMounted(() => {
  if (!videoPlayer.value) return;

  videoPlayer.value.addEventListener("error", () => {
    console.error("Video error:", videoPlayer.value?.error);
  });

  videoPlayer.value.addEventListener("timeupdate", () => {
    const current = videoPlayer.value!.currentTime;

    const subtitle = subtitles.value.find(
      (s) => current >= s.start && current <= s.end,
    );

    activeSubtitle.value = subtitle ? subtitle.text : "";
  });
});

function playVideo() {
  videoPlayer.value?.play().catch((error) => {
    console.error("Play failed:", error);
  });
}
</script>

<template>
  <div class="main-content">
    <div class="player-wrapper" style="position: relative; width: 100%">
      <div v-if="!video" class="no-video-placeholder">
        Select a video from Explorer to begin.
      </div>

      <video
        v-else
        ref="videoPlayer"
        controls
        autoplay
        style="width: 100%; display: block"
      ></video>

      <div
        ref="subtitleOverlay"
        class="subtitle-overlay"
        v-show="activeSubtitle"
      >
        {{ activeSubtitle }}
      </div>
    </div>

    <button @click="playVideo">Play Test</button>

    <div class="video-title-overlay">
      {{ video?.name ?? "" }}
    </div>
  </div>
</template>
