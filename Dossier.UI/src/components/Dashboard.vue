<template>
    <div class="search grid grid-cols-[320px_minmax(0,1fr)_360px] h-screen w-screen items-center justify-center w-full">

        <!-- FILE EXPLORER -->
        <FileExplorer
            @video-selected="selectVideo"
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
    path: string;
    name: string;

    metadata?: {

        has_subtitles?: boolean;

        subtitle_path?: string;

    };
}



const currentVideo = ref<VideoItem | null>(null);



function selectVideo(video: VideoItem)
{
    currentVideo.value = video;
}


</script>