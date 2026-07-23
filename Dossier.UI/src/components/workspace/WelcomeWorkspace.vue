<template>
  <div class="flex h-full w-full items-center justify-center p-12">
    <div class="flex flex-col items-center gap-6 text-center max-w-md">
      <!-- Large icon -->
      <div
        class="flex h-24 w-24 items-center justify-center rounded-2xl bg-[var(--surface)] ring-1 ring-[var(--border-strong)]"
      >
        <svg
          class="h-12 w-12 text-[var(--accent-500)] opacity-80"
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

      <!-- Title -->
      <h1 class="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
        No video selected
      </h1>

      <!-- Subtitle -->
      <p class="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
        Select a video from the Explorer to begin.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// WelcomeWorkspace — shown when no video is active
// Future: recent videos, recent searches, storage usage, server status, etc.
</script>
