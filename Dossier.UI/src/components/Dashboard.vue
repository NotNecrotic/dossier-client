<template>

    <div class="search grid grid-cols-[320px_minmax(0,1fr)_360px] h-screen w-screen">

        <!-- FILE EXPLORER -->
        <FileExplorer
            @select-video="selectVideo"
        />


        <!-- VIDEO PLAYER -->
        <VideoPlayer
            :video="currentVideo"
        />


        <!-- AI CHAT -->
        <ChatPanel
            @video-requested="selectVideo"
        />


    </div>

</template>



<script setup lang="ts">

import { ref } from "vue";

import FileExplorer from "./FileExplorer.vue";
import VideoPlayer from "./VideoPlayer.vue";
import ChatPanel from "./ChatPanel.vue";



interface VideoItem
{
    id: string;

    name: string;

    path: string;

    type: "file";

    status?: string;
}



const currentVideo =
    ref<VideoItem | null>(null);



function selectVideo(video: VideoItem)
{
    currentVideo.value = video;
}

</script>