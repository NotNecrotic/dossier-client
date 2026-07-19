<template>
    <div
        class="onboarding-overlay"
        :class="{ hidden: completed }"
    >

        <div class="onboarding-card">

            <!-- Progress -->
            <div class="onboarding-progress">
                <div
                    class="onboarding-progress-fill"
                    :style="{ width: progressWidth }"
                ></div>
            </div>


            <!-- STEP 1 -->
            <div
                v-if="step === 1"
                class="onboarding-step active"
            >

                <div class="onboarding-header">

                    <img
                        src="./assets/icon.png"
                        class="header-icon"
                    >

                    <h2>
                        Welcome to The Dossier
                    </h2>

                </div>


                <p>
                    The Dossier is an intelligent,
                    AI powered local indexing engine.
                </p>

                <p>
                    It scans your videos, compiles metadata,
                    and creates an instantly searchable database.
                </p>

                <p>
                    Let's configure your environment.
                </p>

            </div>



            <!-- STEP 2 -->
            <div
                v-if="step === 2"
                class="onboarding-step"
            >

                <div class="onboarding-header">

                    <h2>
                        📁 Source Directory
                    </h2>

                </div>


                <p>
                    Select the folder Dossier will process videos from.
                </p>


                <div class="folder-input-group">

                    <input
                        v-model="settings.watchFolder"
                        placeholder="Path to video folder..."
                    >


                    <button
                        class="browse-folder-button"
                        @click="browseFolder"
                    >
                        📁
                    </button>

                </div>


            </div>




            <!-- STEP 3 -->
            <div
                v-if="step === 3"
                class="onboarding-step"
            >

                <div class="onboarding-header">

                    <h2>
                        ⚙️ Server Configuration
                    </h2>

                </div>


                <p>
                    Configure your Dossier processing server.
                </p>


                <input
                    v-model="settings.serverUrl"
                    placeholder="Server URL"
                >


                <input
                    v-model="settings.serverKey"
                    type="password"
                    placeholder="Server Key"
                >

            </div>





            <!-- STEP 4 -->
            <div
                v-if="step === 4"
                class="onboarding-step"
            >

                <div class="onboarding-header">

                    <h2>
                        🎨 Appearance
                    </h2>

                </div>


                <p>
                    Choose your preferred theme.
                </p>


                <select v-model="settings.theme">

                    <option value="system">
                        System Default
                    </option>

                    <option value="dark">
                        Dark
                    </option>

                    <option value="light">
                        Light
                    </option>

                </select>


            </div>





            <!-- FOOTER -->
            <div class="onboarding-footer">


                <button
                    :disabled="step === 1"
                    @click="previous"
                >
                    Back
                </button>



                <button
                    v-if="step < 4"
                    @click="next"
                >
                    Next
                </button>


                <button
                    v-else
                    @click="finish"
                >
                    Finish
                </button>


            </div>


        </div>

    </div>
</template>



<script setup lang="ts">

import { computed, reactive, ref } from "vue";
import { saveSettings } from "../services/settingsApi";


const emit = defineEmits<{
    complete: [];
}>();



const step = ref(1);

const completed = ref(false);



const settings = reactive({

    serverUrl:
        "http://127.0.0.1:5187",

    serverKey:
        "",

    watchFolder:
        "",

    uploadLimit:
        0,

    cpuLimit:
        100,

    frameInterval:
        5,

    startOnBoot:
        false,

    startMinimized:
        false,

    theme:
        "system"

});





const progressWidth = computed(() =>
{
    return `${(step.value / 4) * 100}%`;
});





function next()
{
    if(step.value < 4)
        step.value++;
}



function previous()
{
    if(step.value > 1)
        step.value--;
}




async function finish()
{
    try
    {
        await saveSettings(settings);


        completed.value = true;


        emit("complete");

    }
    catch(error)
    {
        console.error(
            "Failed saving onboarding settings",
            error
        );
    }
}





async function browseFolder()
{
    /*
        This will later call Electron IPC:

        window.electron.selectFolder()

        The browser cannot open native
        Windows folder dialogs.
    */


    console.log(
        "Folder picker requested"
    );
}



</script>