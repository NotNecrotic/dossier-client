<template>
    <div class="sidebar">

        <div class="panel-header">

            <span>
                WORKSPACE METRICS
            </span>


            <div class="sidebar-nav-actions">

                <button
                    class="btn-back"
                    v-if="currentPath"
                    @click="goBack"
                >
                    ⌃ BACK
                </button>


            </div>

        </div>



        <div class="path-banner">
            /{{ currentPath || "root" }}
        </div>



        <div class="file-list">


            <div
                v-if="loading"
                class="no-video-placeholder"
            >
                Scanning workspace...
            </div>



            <div
                v-else-if="items.length === 0"
                class="no-video-placeholder"
            >
                Empty Directory
            </div>



            <div
                v-for="item in items"
                :key="item.path"
                class="file-item"
                :class="item.type"
                @click="handleClick(item)"
            >


                <span class="file-icon">

                    {{ 
                        item.type === "directory"
                        ? "📁"
                        : "🎞️"
                    }}

                </span>



                <span class="file-name">

                    {{ item.name }}


                    <span
                        v-if="
                            item.type === 'video'
                            &&
                            !item.metadata?.has_metadata
                        "
                        class="unscanned-badge"
                    >
                        No Metadata
                    </span>


                </span>



                <span
                    v-if="item.type === 'video'"
                    class="file-meta"
                >
                    {{ item.size_mb }} MB
                </span>


            </div>


        </div>


    </div>
</template>



<script setup lang="ts">

import { onMounted, ref } from "vue";



const emit = defineEmits<{

    (
        e: "video-selected",
        video: FileItem
    ): void;

}>();



interface FileItem
{
    name: string;

    path: string;

    type:
        | "video"
        | "directory";


    size_mb?: number;


    metadata?: {

        has_metadata?: boolean;

        has_subtitles?: boolean;

        subtitle_path?: string;

    };
}



const API =
    "http://127.0.0.1:5187";



const items = ref<FileItem[]>([]);

const currentPath = ref("");

const loading = ref(false);





async function loadDirectory(
    path = ""
)
{
    loading.value = true;


    try
    {

        const url =
            path
            ?
            `${API}/api/files?path=${encodeURIComponent(path)}`
            :
            `${API}/api/files`;



        const response =
            await fetch(url);



        if(!response.ok)
            throw new Error(
                "Failed loading directory"
            );



        const data =
            await response.json();



        currentPath.value =
            data.currentPath;



        items.value =
            data.items;


    }
    catch(error)
    {

        console.error(
            "Directory load failed:",
            error
        );


        items.value = [];

    }
    finally
    {
        loading.value = false;
    }

}





function handleClick(
    item: FileItem
)
{

    if(item.type === "directory")
    {
        loadDirectory(
            item.path
        );

        return;
    }



    if(item.type === "video")
    {
        emit(
            "video-selected",
            item
        );
    }

}





function goBack()
{

    if(!currentPath.value)
        return;



    const parts =
        currentPath.value
            .split("/")
            .filter(Boolean);



    parts.pop();



    loadDirectory(
        parts.join("/")
    );

}





onMounted(() =>
{
    loadDirectory();
});



</script>