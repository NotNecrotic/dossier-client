<script setup lang="ts">

import { ref } from "vue";
import { Sparkles, Send, FolderOpen, Settings } from "@lucide/vue";
import Icon from "../assets/icon.svg";


const emit = defineEmits<{
    dashboard: [];
    settings: [];
}>();

const searchText = ref("");

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
    if (!searchText.value.trim())
        return;


    loading.value = true;

    statusMessage.value = 
        "Parsing localized semantic embeddings...";


    try
    {
        const response = await fetch(
            "http://127.0.0.1:5187/api/chat",
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                {
                    message: searchText.value
                })
            }
        );


        if (!response.ok)
            throw new Error("Chat request failed");


        const data = await response.json();


        console.log("AI Response:", data);


        /*
            Later:
            - switch dashboard
            - jump video
            - load timeline
        */


        openDashboard();

        searchText.value = "";

    }
    catch(error)
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
    <div class="flex flex-1 justify-center items-center z-1 search">
        <div class="w-full max-w-2xl">

            <div class="flex items-center justify-center gap-1">
                <icon class="h-16 w-16 text-[var(--text)]"></icon>
                <h1 class="text-4xl sm:text-5xl font-bold tracking-[0.02em] translate-y-1">OSSIER</h1>
            </div>

            <div class="mt-12 w-full overflow-hidden relative p-[2px] rounded-full">
                <div class="search-border-glow-layer"></div>
                <div class="flex items-center gap-2 rounded-full bg-[var(--panel)] border-2 border-[var(--border-strong)] py-2 pl-5 pr-2" @submit.prevent="submitSearch">
                    <sparkles class="h-4 w-4 opacity-70 text-[var(--accent-500)]"></sparkles>
                    <input v-model="searchText" id="searchInput" placeholder="Describe the scene, conversation, or moment..." class="w-full py-2 focus:outline-none text-sm sm:text-base" @keydown="handleKeydown"></input>
                    <button type="button" id="searchSubmit" class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-500)] text-black hover:opacity-90 disabled:opacity-80">
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
                    <settings class="h-4 w-4"></settings>
                </button>
            </div>

        </div>
    </div>

</template>