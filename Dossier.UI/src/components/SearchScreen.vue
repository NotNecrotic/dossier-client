<script setup lang="ts">

import { ref } from "vue";
import { Sparkles, Send, FolderOpen, Settings as SettingsIcon} from "@lucide/vue";
import Icon from "../assets/icon.svg";


const emit = defineEmits<{
    dashboard: [];
    settings: [];
}>();

const searchText = ref("");
const searching = ref(false);

const loading = ref(false);

const statusMessage = ref("");

function openDashboard()
{
    emit("dashboard");
}


function openSettings()
{
    emit("settings");
}


async function submitSearch()
{
    const question = searchText.value.trim();

    if (!question)
        return;

    loading.value = true;

    statusMessage.value =
        "Searching your video library...";

    try
    {
        const response = await fetch(
            "http://127.0.0.1:5187/api/query",
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question
                })
            }
        );

        if (!response.ok)
            throw new Error("Query request failed");

        const data = await response.json();

        console.log("Query Response:", data);

        // data.answer
        // data.references

        openDashboard();

        searchText.value = "";
    }
    catch (error)
    {
        console.error(error);

        statusMessage.value =
            "Error connecting to Dossier Engine.";
    }
    finally
    {
        loading.value = false;
    }
}



function handleKeydown(event: KeyboardEvent)
{
    if(event.key === "Enter" && !event.shiftKey)
    {
        event.preventDefault();

        submitSearch();
    }
}

</script>

<template>
    <div class="flex flex-1 mx-auto px-8 py-12 justify-center items-center h-screen z-1 search">
        <div class="w-full max-w-2xl">

            <div class="flex items-center justify-center gap-1">
                <icon class="h-16 w-16 text-[var(--text)]"></icon>
                <h1 class="text-4xl sm:text-5xl font-bold tracking-[0.02em] translate-y-1">OSSIER</h1>
            </div>

            <div class="mt-12 w-full overflow-hidden relative p-[2px] rounded-full z-0">
                <div class="search-border-glow-layer"></div>
                <div class="flex items-center gap-2 rounded-full bg-[var(--panel)] border-2 border-[var(--border-strong)] py-2 pl-5 pr-2" @submit.prevent="submitSearch">
                    <sparkles class="h-4 w-4 opacity-70 text-[var(--accent-500)]"></sparkles>
                    <input v-model="searchText" id="searchInput" placeholder="Describe the scene, conversation, or moment..." class="w-full py-2 focus:outline-none text-sm sm:text-base" @keydown="handleKeydown"></input>
                    <button type="button" id="searchSubmit" @click="submitSearch" class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-500)] text-black hover:opacity-90 disabled:opacity-80">
                        <send class="h-4 w-4"></send>
                    </button>
                </div>
            </div>






            <div 
                id="menuChatStatusContainer"
            >

                <div 
                    v-if="statusMessage"
                    class="menu-status-notice"
                >
                    {{ statusMessage }}
                </div>

            </div>







            <div class="utility-dock">
                <button class="flex items-center gap-2 rounded-full bg-[var(--accent-500)] px-5 py-2.5 text-sm font-medium text-black transition-fast hover:opacity-90" @click="openDashboard">
                    <folder-open class="h-4 w-4"></folder-open>
                    Explore Library
                </button>

                <button class="flex items-center justify-center h-10 w-10 gap-2 rounded-full bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text)]" @click="openSettings">
                    <settings-icon class="h-4 w-4"></settings-icon>
                </button>
            </div>

        </div>
    </div>

</template>