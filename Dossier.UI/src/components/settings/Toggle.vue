<script setup>
defineProps({
  value: { type: Boolean, required: true },
  testid: { type: String, default: undefined },
});

const emit = defineEmits(["change"]);

function toggle() {
  emit("change", !arguments[0]);
}
</script>

<template>
  <button type="button" role="switch" :aria-checked="value" @click="emit('change', !value)"
    :class="[
      'relative h-6 w-11 rounded-full border',
      value
        ? 'bg-[var(--accent-500)] border-[var(--accent-500)]'
        : 'bg-[var(--surface)] border-[var(--border-strong)]'
    ]">
    <span :class="[
      'absolute top-0.75 h-4 w-4 rounded-full bg-white transition-transform',
      value
        ? 'translate-x-0.5'
        : '-translate-x-4.5'
    ]"></span>
  </button>
</template>