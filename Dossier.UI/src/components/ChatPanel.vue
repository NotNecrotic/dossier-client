<script setup lang="ts">
import { ref, nextTick, watch } from "vue";
import { Sparkles, ChevronsRight, Send } from "@lucide/vue";
import type { QueryKeypoint, QueryResponse } from "./workspace/WorkspaceState";

interface ChatMessage {
  sender: "user" | "ai" | "system-alert";

  text: string;
}

const props = defineProps<{
  searchResult: QueryResponse | null;
}>();

const emit = defineEmits<{
  (e: "video-requested", point: QueryKeypoint): void;
}>();

const API = "http://127.0.0.1:5187";

const input = ref("");

const loading = ref(false);

const chatHistory = ref<HTMLDivElement | null>(null);

const messages = ref<ChatMessage[]>([]);

const keypoints = ref<QueryKeypoint[]>([]);

function addMessage(text: string, sender: ChatMessage["sender"]) {
  messages.value.push({
    text,
    sender,
  });

  nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight;
    }
  });
}

watch(
  () => props.searchResult,
  (result) => {
    if (!result) return;

    // clear old results
    keypoints.value = result.keypoints ?? [];

    addMessage(result.answer, "ai");
  },
  {
    immediate: true,
  },
);

function jump(point: QueryKeypoint) {
  console.log("Jumping:", point);

  emit("video-requested", point);
}

async function sendMessage() {
  const text = input.value.trim();

  if (!text || loading.value) return;

  addMessage(text, "user");

  input.value = "";

  loading.value = true;

  try {
    const response = await fetch(`${API}/api/query`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        question: text,
      }),
    });

    if (!response.ok) throw new Error("Query failed");

    const data = await response.json();

    addMessage(data.answer, "ai");

    keypoints.value = data.keypoints ?? [];
  } catch (error) {
    console.error(error);

    addMessage("Unable to connect to Dossier Engine.", "system-alert");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="flex h-full flex-col bg-[var(--panel)] border-l-2 border-[var(--border-strong)]"
  >
    <div
      class="flex h-9 items-center justify-between border-b border-[var(--border-strong)] px-2"
    >
      <div class="flex items-center gap-1.5">
        <sparkles class="h-4 w-4 text-[var(--accent-500)]"></sparkles>
        <span
          class="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]"
          >Assistant</span
        >
      </div>
      <button
        type="button"
        class="rounded-[3px] p-1 text-[var(--text-muted)] hover:bg-[var(--accent-500)] hover:text-[var(--text)]"
      >
        <chevrons-right class="h-4 w-4"></chevrons-right>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-4">
      <div class="flex">
        <div class="w-full border-l-2 border-[var(--accent-500)] pl-3">
          <div class="text-sm text-[var(--text)]">
            Hi. Ask me anything about your video library — I'll surface the
            exact moment.
          </div>
        </div>
      </div>
    </div>

    <div class="chat-history" ref="chatHistory">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="chat-message"
        :class="message.sender"
      >
        {{ message.text }}
      </div>
      <div v-for="point in keypoints" :key="point.start" class="mt-2">
        <button
          @click="jump(point)"
          class="w-full text-left rounded bg-[var(--surface)] p-3 hover:bg-[var(--accent-500)]"
        >
          <div class="font-semibold text-sm">
            {{ point.reason }}
          </div>

          <div class="text-xs opacity-70 mt-1">
            {{ point.text }}
          </div>

          <div class="text-xs mt-1">Jump to {{ point.start }}s</div>
        </button>
      </div>

      <div v-if="loading" class="chat-message system-loading">
        AI is looking through archives...
      </div>
    </div>

    <form class="border-t border-[var(--border-strong)] p-3">
      <div
        class="flex items-center gap-2 rounded-full border-2 border-[var(--border-strong)] bg-[var(--surface)] pl-4 pr-1.5 py-1.5 focus-within:shadow-[0_0_0_4px_var(--accent-glow)]"
      >
        <Sparkles
          class="h-4 w-4 flex-shrink-0 text-[var(--accent-500)] opacity-70"
        ></Sparkles>
        <input
          placeholder="Ask about your videos…"
          class="w-full bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
        />
        <button
          type="submit"
          class="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)]"
        >
          <send class="h-4 w-4"></send>
        </button>
      </div>
      <div>
        <span></span>
        <span>
          <span></span>
        </span>
      </div>
    </form>
  </div>
</template>
