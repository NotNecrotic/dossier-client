<script setup lang="ts">

import { ref } from "vue";

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

<div 
    id="introContainer"
    class="intro-container"
>

    <div class="hero-center-group">


        <h1 class="brand-title">
            THE DOSSIER
        </h1>


        <p class="brand-subtitle">
            Find any moment from any video in seconds.
        </p>



        <div class="glow-input-wrapper">

            <div class="border-glow-layer"></div>


            <form 
                class="interactive-search-box"
                @submit.prevent="submitSearch"
            >

                <textarea
                    v-model="searchText"
                    id="introInput"
                    placeholder="Describe the scene, conversation, or moment..."
                    rows="1"
                    @keydown="handleKeydown"
                />


                <button
                    type="submit"
                    id="introSubmitBtn"
                    class="action-submit-btn"
                    :disabled="loading"
                >

                    <span v-if="!loading">
                        ⚡
                    </span>


                    <span 
                        v-else
                        class="thinking-loader-dots"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>


                </button>

            </form>

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


            <button
                class="utility-btn"
                @click="openDashboard"
            >

                <span class="btn-icon">
                    📁
                </span>

                Explore Workspace

            </button>



            <button
                class="utility-btn icon-only"
                @click="openSettings"
            >

                <span class="btn-icon">
                    ⚙️
                </span>

            </button>


        </div>


    </div>

</div>

</template>