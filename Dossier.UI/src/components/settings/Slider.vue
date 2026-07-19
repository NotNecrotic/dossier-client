<script setup>
defineProps({
    value: { type: Number, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    step: { type: Number, default: 1 },
    unit: { type: String, default: "" },
    testid: { type: String, default: undefined },
});

const emit = defineEmits(["change"]);

function updateValue(event) {
    emit("change", parseInt(event.target.value, 10));
}
</script>

<template>
    <div class="flex items-center gap-3">
        <input type="range" :min="min" :max="max" :step="step" :value="value" @input="updateValue"
            class="w-56"/>

        <span class="w-20 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-0.5 text-center text-xs text-[var(--text)]">{{ value }}{{ unit }}</span>
    </div>
</template>