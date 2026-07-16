<script setup>
import { ref, onMounted } from "vue";
import { toast } from "vue-sonner";

import { useSettings } from "../composables/useSettings";

import Section from "./settings/Section.vue";
import Row from "./settings/Row.vue";
import PillInput from "./settings/PillInput.vue";
import Slider from "./settings/Slider.vue";
import Toggle from "./settings/Toggle.vue";
import { ACCENTS } from "../constants/accents";

import { Server, HardDrive, Cpu, Palette, Check, Loader2, KeyRound, Sun, Moon, Zap, MonitorCog } from "@lucide/vue";

const {
    settings,
    updateSettings
} = useSettings();

const testing = ref(false);
const testResult = ref(null);

async function set(patch) {
    settings.value = {
        ...settings.value,
        ...patch,
    };

    await updateSettings(settings.value);
}

async function runTest() {
    testing.value = true;
    testResult.value = null;

    try {
        const res = await serverApi.test({
            url: settings.server_url,
            key: settings.server_key,
        });

        testResult.value = res;

        if (res.ok) {
            toast.success(`Server reachable · ${res.latency_ms}ms`);
        } else {
            toast.error(res.message || "Server unreachable");
        }

    } catch {
        toast.error("Test failed");

        testResult.value = {
            ok: false,
            message: "Test failed",
        };

    } finally {
        testing.value = false;
    }
}
</script>


<template>
    <div v-if="!settings" class="p-8 text-[var(--text-secondary]">
        Loading settings…
    </div>

    <div v-else class="mx-auto max-w-4xl px-8 py-12">
        <div class="mb-10">
            <h1 class="font-heading text-4xl font-bold tracking-tight text-[var(--text)]">Settings</h1>
            <p class="mt-2 text-sm text-[var(--text-secondary)]">Configure how Dossier connects to your processing
                server and indexes your library.</p>
        </div>

        <div class="space-y-6">
            <Section :icon="Server" title="Connection"
                description="Where Dossier delegates transcription, embeddings, and AI queries.">

                <Row title="Processing server URL" description="Press Enter or click away to save.">
                    <PillInput :value="settings.server_url" placeholder="https://ollama.local:11434" mono
                        @commit="set({ server_url: $event })" />
                </Row>

                <Row title="Server key" description="Access key stored on the local engine only.">
                    <PillInput :value="settings.server_key" placeholder="sk-•••" type="password" mono :icon="KeyRound"
                        @commit="set({ server_key: $event })" />
                </Row>

                <Row title="Connection test" description="Verify Dossier can reach your server.">
                    <div class="flex items-center gap-3">

                        <span v-if="testResult" :class="[
                            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]',
                            testResult.ok
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                                : 'border-red-500/40 bg-red-500/10 text-red-400'
                        ]">

                            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>

                            {{ testResult.ok
                                ? `OK · ${testResult.latency_ms}ms`
                                : "Failed"
                            }}

                        </span>

                        <button type="button" :disabled="testing || !settings.server_url" @click="runTest" class="flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-4 py-1.5 text-xs hover:bg-[var(--surface)] disabled:text-[var(--text-muted)]">
                            <Loader2 v-if="testing" class="h-3.5 w-3.5 animate-spin"/>
                            <Zap v-else class="h-3.5 w-3.5 text-[var(--accent-500)]"/>
                            Test connection
                        </button>

                    </div>
                </Row>
            </Section>

            <Section :icon="HardDrive" title="Storage" description="Where your videos live on disk.">
                <Row title="Video root folder" description="Top-level folder to scan recursively.">
                    <PillInput :value="settings.video_root" placeholder="/Users/you/Videos" mono
                        @commit="set({ video_root: $event })"/>
                </Row>
            </Section>

            <Section :icon="Cpu" title="Processing" description="Limits applied while indexing runs locally.">
                <Row title="CPU usage limit" description="Cap engine CPU during processing.">
                    <Slider :value="settings.cpu_limit" :min="10" :max="100" :step="5" unit="%"
                        @change="set({ cpu_limit: $event })"/>
                </Row>

                <Row title="Upload bandwidth" description="Maximum outbound throughput.">
                    <Slider :value="settings.upload_limit_mbps" :min="1" :max="200" unit="Mbps"
                        @change="set({ upload_limit_mbps: $event })"/>
                </Row>

                <Row title="Frame sampling rate" description="Frames per second sampled for embeddings.">
                    <Slider :value="settings.frame_sampling" :min="1" :max="30" unit="fps"
                        @change="set({ frame_sampling: $event })"/>
                </Row>
            </Section>

            <Section :icon="Palette" title="Appearance" description="Theme and accent colour. Applies instantly.">
                <Row title="Theme" description="Dark by default. Choose whichever is easier on your eyes.">
                    <div class="flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] p-1">

                        <button @click="set({ theme: 'dark' })"
                            class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs" :class="settings.theme === 'dark'
                                ? 'bg-[var(--surface)] text-[var(--accent-500)]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'">
                            <Moon class="h-3.5 w-3.5"/>
                            Dark
                        </button>

                        <button @click="set({ theme: 'light' })"
                            class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs" :class="settings.theme === 'light'
                                ? 'bg-[var(--surface)] text-[var(--accent-500)]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'">
                            <Sun class="h-3.5 w-3.5"/>
                            Light
                        </button>

                    </div>
                </Row>

                <Row title="Accent colour" description="Used for primary actions and AI jump markers.">
                    <div class="flex items-center gap-2">

                        <button v-for="a in Object.values(ACCENTS)" :key="a.name" @click="set({ accent: a.name })"
                            class="relative flex h-7 w-7 items-center justify-center rounded-full border"
                            :class="settings.accent === a.name
                                ? 'border-[var(--border-strong)] scale-110'
                                : 'border-[var(--border-strong)] hover:scale-110'" :style="{
                                    backgroundColor: a.main,
                                }">
                            <Check v-if="settings.accent === a.name" class="h-3.5 w-3.5 text-white" :stroke-width="3" />
                        </button>

                    </div>
                </Row>
            </Section>

            <Section :icon="MonitorCog" title="Application" description="Startup behaviour and background operation.">
                <Row title="Start on system boot" description="Launch the Dossier engine automatically.">
                    <Toggle :value="settings.start_on_boot" @change="set({ start_on_boot: $event })"/>
                </Row>

                <Row title="Run in system tray" description="Keep the engine indexing after the UI is closed.">
                    <Toggle :value="settings.tray_mode" @change="set({ tray_mode: $event })"/>
                </Row>
            </Section>
        </div>
    </div>
</template>