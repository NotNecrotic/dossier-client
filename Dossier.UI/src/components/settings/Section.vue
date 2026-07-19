<script setup>
import { defineProps } from "vue";

defineProps({
  icon: { type: Object, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
});

</script>

<template>
  <section class="relative overflow-hidden rounded-2xl bg-[var(--panel)] border-2 border-[var(--border-strong)] p-6">

    <div class="relative mb-5 flex items-start gap-3">
      <div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-glow)] text-[var(--accent-500)]">
        <component :is="icon" class="h-4 w-4"/>
      </div>

      <div>
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <p v-if="description" class="mt-0.5 text-xs text-[var(--text-secondary)]">{{ description }}</p>
      </div>
    </div>

    <div class="relative space-y-1">
      <slot></slot>
    </div>

  </section>
</template>