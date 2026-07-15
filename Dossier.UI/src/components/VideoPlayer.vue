<template>

<div class="main-content">

    <div
        class="player-wrapper"
        style="position: relative; width:100%;"
    >


        <div
            v-if="!video"
            class="no-video-placeholder"
        >
            Select a target sequence or video clip from the panel to begin execution.
        </div>



        <video
            v-else
            ref="videoPlayer"
            controls
            style="width:100%;"
        >
        </video>



        <!-- Custom subtitle overlay -->
        <div
            ref="subtitleOverlay"
            class="subtitle-overlay"
            v-show="activeSubtitle"
        >
            {{ activeSubtitle }}
        </div>


    </div>



    <div
        class="video-title-overlay"
    >

        {{ video?.name ?? "" }}

    </div>


</div>

</template>



<script setup lang="ts">

import {
    ref,
    watch,
    onMounted
} from "vue";



interface VideoItem
{
    name:string;

    path:string;

    metadata?: {

        has_subtitles?: boolean;

        subtitle_path?: string;

    };
}



const props = defineProps<{

    video:
        VideoItem | null;

}>();




const API =
    "http://127.0.0.1:5187";



const videoPlayer =
    ref<HTMLVideoElement | null>(null);



const subtitleOverlay =
    ref<HTMLDivElement | null>(null);



const activeSubtitle =
    ref("");



interface Subtitle
{
    start:number;

    end:number;

    text:string;
}



const subtitles =
    ref<Subtitle[]>([]);





watch(
    () => props.video,
    () =>
    {
        if(props.video)
        {
            loadVideo(
                props.video
            );
        }
    }
);







async function loadVideo(
    video:VideoItem
)
{

    if(!videoPlayer.value)
        return;



    const url =
        `${API}/api/video/${encodeURIComponent(video.path)}`;



    videoPlayer.value.src =
        url;



    videoPlayer.value.load();



    subtitles.value = [];



    if(
        video.metadata?.has_subtitles
        &&
        video.metadata.subtitle_path
    )
    {

        await loadSubtitles(
            video.metadata.subtitle_path
        );

    }


}







async function loadSubtitles(
    path:string
)
{

    try
    {

        const response =
            await fetch(
                `${API}${path}`
            );



        if(!response.ok)
            return;



        const text =
            await response.text();



        subtitles.value =
            parseSubtitles(text);


    }
    catch(error)
    {
        console.error(
            "Subtitle loading failed",
            error
        );
    }

}







function parseSubtitles(
    text:string
):Subtitle[]
{

    /*
        Expected format:

        00:00:01 --> 00:00:04
        Hello world

    */


    const blocks =
        text.split(/\n\n+/);



    return blocks
        .map(block =>
        {

            const lines =
                block.split("\n");



            if(lines.length < 2)
                return null;



            const times =
                lines[0]
                    .split("-->");



            if(times.length !== 2)
                return null;



            return {

                start:
                    timestampToSeconds(
                        times[0].trim()
                    ),


                end:
                    timestampToSeconds(
                        times[1].trim()
                    ),


                text:
                    lines
                    .slice(1)
                    .join("\n")

            };


        })
        .filter(
            (x): x is Subtitle =>
                x !== null
        );

}







function timestampToSeconds(
    value:string
)
{

    const parts =
        value
        .replace(",", ".")
        .split(":")
        .map(Number);



    return (
        parts[0] * 3600
        +
        parts[1] * 60
        +
        parts[2]
    );

}







onMounted(() =>
{

    if(!videoPlayer.value)
        return;



    videoPlayer.value.addEventListener(
        "timeupdate",
        () =>
        {

            const current =
                videoPlayer.value!.currentTime;



            const subtitle =
                subtitles.value.find(
                    s =>
                        current >= s.start
                        &&
                        current <= s.end
                );



            activeSubtitle.value =
                subtitle
                ?
                subtitle.text
                :
                "";

        }
    );

});



</script>