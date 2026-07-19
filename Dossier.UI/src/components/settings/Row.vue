<script setup>

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
});

</script>

<template>
  <div class="flex items-center justify-between gap-6 py-4">

    <div class="min-w-0 flex-1">
      <div class="text-sm text-[var(--text)]">{{ title }}</div>
      <div v-if="description" class="mt-0.5 text-xs text-[var(--text-secondary)]">{{ description }}</div>
    </div>

    <div class="flex-shrink-0">
      <slot></slot>
    </div>

  </div>
</template>