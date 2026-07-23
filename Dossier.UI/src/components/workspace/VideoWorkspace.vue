<template>
  <div class="flex h-full w-full flex-col gap-4 overflow-y-auto p-6">
    <!-- Video Information Card -->
    <div
      class="rounded-xl bg-[var(--surface-2)] ring-1 ring-[var(--border-strong)] p-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-3)] ring-1 ring-[var(--border-strong)] shrink-0"
          >
            <svg
              class="h-5 w-5 text-[var(--accent-500)]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
              <polygon points="10,8 16,12 10,16" />
            </svg>
          </div>
          <div class="min-w-0">
            <h2
              class="text-sm font-semibold text-[var(--text-primary)] truncate"
            >
              {{ video?.name ?? "Untitled" }}
            </h2>
            <p class="text-xs text-[var(--text-muted)] truncate mt-0.5">
              {{ video?.path ?? "" }}
            </p>
          </div>
        </div>
        <div
          v-if="video?.status"
          class="shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize"
          :class="statusClass"
        >
          {{ video.status }}
        </div>
      </div>
    </div>

    <!-- Video Player Card -->
    <div
      class="relative overflow-hidden rounded-xl bg-black ring-1 ring-[var(--border-strong)]"
      style="aspect-ratio: 16 / 9"
    >
      <video
        ref="videoPlayer"
        controls
        autoplay
        class="h-full w-full"
        @error="onVideoError"
        @timeupdate="onTimeUpdate"
      ></video>

      <!-- Subtitle overlay -->
      <div
        v-show="activeSubtitle"
        class="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-center text-sm text-white backdrop-blur-sm max-w-[80%] pointer-events-none"
      >
        {{ activeSubtitle }}
      </div>
    </div>

    <!-- Timeline Card (placeholder for future markers, search hits, etc.) -->
    <div
      class="rounded-xl bg-[var(--surface-2)] ring-1 ring-[var(--border-strong)] p-4"
    >
      <h3
        class="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]"
      >
        Timeline
      </h3>
      <div
        class="mt-3 flex items-center justify-center rounded-lg bg-[var(--surface-3)] py-8 text-sm text-[var(--text-muted)]"
      >
        Markers, search hits, scenes & bookmarks will appear here
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from "vue";
import type { VideoItem } from "./WorkspaceState";

const API = "http://127.0.0.1:5187";

const props = defineProps<{
  video: VideoItem | null;
}>();

const videoPlayer = ref<HTMLVideoElement | null>(null);
const activeSubtitle = ref("");
const videoError = ref<string | null>(null);

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

const subtitles = ref<Subtitle[]>([]);

const statusClass = computed(() => {
  if (!props.video?.status) return "";
  const map: Record<string, string> = {
    indexed: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
    processing: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
    unindexed: "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20",
  };
  return (
    map[props.video.status] ??
    "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20"
  );
});

watch(
  () => props.video,
  async (newVideo) => {
    if (newVideo) {
      videoError.value = null;
      await nextTick();
      loadVideo(newVideo);
    }
  },
);

async function loadVideo(video: VideoItem) {
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
    video.addEventListener("loadedmetadata", seek, { once: true });
  }
}

function onVideoError() {
  videoError.value = videoPlayer.value?.error?.message ?? "Unknown error";
  console.error("Video error:", videoPlayer.value?.error);
}

function onTimeUpdate() {
  if (!videoPlayer.value) return;
  const current = videoPlayer.value.currentTime;
  const subtitle = subtitles.value.find(
    (s) => current >= s.start && current <= s.end,
  );
  activeSubtitle.value = subtitle ? subtitle.text : "";
}

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

function playVideo() {
  videoPlayer.value?.play().catch((error) => {
    console.error("Play failed:", error);
  });
}

defineExpose({
  jumpTo,
  loadVideo,
  playVideo,
});
</script>
