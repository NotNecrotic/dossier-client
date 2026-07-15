<script setup>

import { ref,onMounted } from "vue"
import { getSettings,saveSettings } from "../services/settingsApi"


const emit = defineEmits([
    "close"
])


const settings = ref({})


onMounted(async()=>{

    settings.value = await getSettings()

})


async function save()
{

    await saveSettings(settings.value)

    emit("close")

}


</script>



<template>

<div class="modal-overlay open">

<div class="settings-card">

<h3>
⚙️ Dossier Settings
</h3>


<label>
Server URL
</label>

<input 
v-model="settings.serverUrl"
/>



<label>
Watch Folder
</label>

<input
v-model="settings.watchFolder"
/>


<label>
CPU Limit
</label>

<input 
type="number"
v-model="settings.cpuLimit"
/>


<button @click="emit('close')">
Cancel
</button>


<button @click="save">
Save
</button>


</div>

</div>

</template>