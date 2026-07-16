<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    value: { type: [String, Number], default: "" },
    placeholder: { type: String, default: "" },
    testid: { type: String, default: undefined },
    type: { type: String, default: "text" },
    mono: { type: Boolean, default: false },
    icon: { type: Object, default: null },
});

const emit = defineEmits(["commit"]);

const draft = ref(props.value ?? "");

watch(
    () => props.value,
    (newValue) => {
        draft.value = newValue ?? "";
    }
);

function commit() {
    if (draft.value !== (props.value ?? "")) {
        emit("commit", draft.value);
    }
}

function handleKeydown(event) {
    if (event.key === "Enter") {
        event.target.blur();
    }
}

</script>
<template>
    <div class="flex w-80 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2">
        <component v-if="icon" :is="icon" class="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />

        <input v-model="draft" :type="type" :placeholder="placeholder" @blur="commit"
            @keydown="handleKeydown" :class="[
                'w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]',
                mono && 'font-mono'
            ]" />
    </div>
</template>