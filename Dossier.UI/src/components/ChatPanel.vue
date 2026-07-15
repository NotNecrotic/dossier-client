<template>

<div class="chat-panel">

    <div class="panel-header">
        DOSSIER COORDINATOR
    </div>



    <div
        class="chat-history"
        ref="chatHistory"
    >

        <div
            v-for="(message, index) in messages"
            :key="index"
            class="chat-message"
            :class="message.sender"
        >

            {{ message.text }}

        </div>



        <div
            v-if="loading"
            class="chat-message system-loading"
        >
            AI is looking through archives...
        </div>


    </div>





    <div class="chat-input-wrapper">

        <form
            class="chat-form"
            @submit.prevent="sendMessage"
        >

            <input
                v-model="input"
                class="chat-input"
                placeholder="Ask coordinator to locate logs..."
                autocomplete="off"
            >


            <button
                class="chat-submit"
                type="submit"
                :disabled="loading"
            >
                SEND
            </button>


        </form>


    </div>


</div>

</template>



<script setup lang="ts">

import {
    ref,
    nextTick
} from "vue";



interface ChatMessage
{
    sender:
        | "user"
        | "ai"
        | "system-alert";

    text:string;
}



interface MediaPayload
{
    videoFileUrl:string;

    filePath?:string;

    fileName?:string;

    jumpToSeconds:number;

    sceneReason?:string;

    metadata?: {

        has_subtitles?:boolean;

        subtitle_path?:string;

    };
}





const emit = defineEmits<{

    (
        e:"video-requested",
        payload:MediaPayload
    ):void;

}>();





const API =
    "http://127.0.0.1:5187";





const input =
    ref("");



const loading =
    ref(false);



const chatHistory =
    ref<HTMLDivElement | null>(null);





const messages =
    ref<ChatMessage[]>([]);







async function sendMessage()
{

    const text =
        input.value.trim();



    if(!text || loading.value)
        return;



    addMessage(
        text,
        "user"
    );



    input.value = "";

    loading.value = true;



    try
    {

        const response =
            await fetch(
                `${API}/api/chat`,
                {
                    method:"POST",

                    headers:
                    {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                        {
                            message:text
                        })
                }
            );



        if(!response.ok)
            throw new Error(
                "Chat request failed"
            );



        const data =
            await response.json();



        addMessage(
            data.textResponse,
            "ai"
        );



        if(
            data.actionRequired
            &&
            data.mediaPayload
        )
        {

            addMessage(
                `🎬 Jumping to ${data.mediaPayload.jumpToSeconds}s - ${data.mediaPayload.sceneReason}`,
                "system-alert"
            );


            emit(
                "video-requested",
                data.mediaPayload
            );

        }


    }
    catch(error)
    {

        console.error(error);


        addMessage(
            "Unable to connect to Dossier Engine.",
            "system-alert"
        );

    }
    finally
    {
        loading.value = false;
    }

}







function addMessage(
    text:string,
    sender:ChatMessage["sender"]
)
{

    messages.value.push(
    {
        text,
        sender
    });


    nextTick(() =>
    {

        if(chatHistory.value)
        {
            chatHistory.value.scrollTop =
                chatHistory.value.scrollHeight;
        }

    });

}



</script>