<script setup lang="ts">

import { computed, ref } from "vue";
import { ChevronRight, Folder, FolderOpen, ChevronsLeft, Search, PanelLeft } from "@lucide/vue";
import { getExplorerTree, type ExplorerNode } from "../api/explorer";

type NodeStatus = "indexed" | "processing" | "unindexed";

const nodes = ref<ExplorerNode[]>([]);

const emit = defineEmits<{
    (e: "select-video", video: ExplorerNode): void;
}>();

const expanded = ref(new Set(["f-root"]));
const selectedId = ref<string | null>(null);
const filter = ref("");

const childrenMap = computed(() => {

    const map: Record<string, ExplorerNode[]> = {};

    for (const node of nodes.value) {

        const key = node.parentId ?? "__root__";

        if (!map[key]) {
            map[key] = [];
        }

        map[key].push(node);
    }


    // folders first, then files

    for (const key in map) {

        map[key].sort((a, b) => {

            if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1;
            }

            return a.name.localeCompare(b.name);
        });

    }


    return map;

});

// Visible tree rows

const visibleRows = computed(() => {

    const rows: {
        node: ExplorerNode;
        depth: number;
        hasChildren: boolean;
        expanded: boolean;
    }[] = [];


    const stack = (childrenMap.value.__root__ || [])
        .map(node => ({
            node,
            depth: 0
        }));


    const term = filter.value.trim().toLowerCase();


    while (stack.length) {

        const item = stack.shift()!;

        const node = item.node;

        const children =
            childrenMap.value[node.id] || [];


        const hasChildren =
            node.type === "folder" &&
            children.length > 0;


        const matches =
            !term ||
            node.name.toLowerCase().includes(term);


        const isExpanded =
            expanded.value.has(node.id) ||
            (!!term && matches);



        if (matches || !term) {

            rows.push({
                node,
                depth: item.depth,
                hasChildren,
                expanded: isExpanded
            });

        }



        if (hasChildren && isExpanded) {

            stack.unshift(
                ...children.map(child => ({
                    node: child,
                    depth: item.depth + 1
                }))
            );

        }

    }


    return rows;

});

// Actions

function toggle(id: string) {

    const next = new Set(expanded.value);


    if (next.has(id)) {
        next.delete(id);
    }
    else {
        next.add(id);
    }


    expanded.value = next;

}



function selectNode(node: ExplorerNode) {

    selectedId.value = node.id;


    if (node.type === "folder") {

        const children =
            childrenMap.value[node.id] || [];


        if (children.length) {
            toggle(node.id);
        }

    }

    if(
        node.type === "file" &&
        node.name.match(/\.(mp4|mkv|webm)$/i)
    )
    {
        emit("select-video", node);
    }
}


function statusSymbol(status?: NodeStatus) {

    switch(status) {

        case "indexed":
            return "✓";

        case "processing":
            return "◌";

        case "unindexed":
            return "!";

        default:
            return "";

    }

}

async function loadTree(){

    nodes.value = await getExplorerTree();

    const root = nodes.value.find(
        node => node.parentId === null
    );


    if (root) {
        expanded.value.add(root.id);
    }
}

loadTree();
</script>

<template>
    <div class="flex h-full flex-col bg-[var(--panel)] border-r-2 border-[var(--border-strong)]">

        <div class="flex h-9 items-center justify-between border-b border-[var(--border-strong)] px-2">
            <div class="flex items-center gap-1.5">
                <panel-left class="h-4 w-4 text-[var(--text-muted)]"></panel-left>
                <span class="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Explorer</span>
            </div>

            <button type="button" title="Collapse" class="rounded-[3px] p-1 text-[var(--text-muted)] hover:bg-[var(--accent-500)] hover:text-[var(--text)]">
                <chevrons-left class="h-4 w-4"></chevrons-left>
            </button>
        </div>

        <div class="border-b border-[var(--border-strong)] p-2">
            <div class="flex items-center gap-1.5 rounded-full bg-[var(--surface)] px-3 py-1.5 border-2 border-[var(--border-strong)] focus-within:shadow-[0_0_0_3px_var(--accent-glow)]">
                <Search class="h-3 w-3 text-[var(--text-muted)]"></Search>
                <input v-model="filter" placeholder="Filter folders…" class="w-full bg-transparent text-xs text-[var(--text))] placeholder:text-[var(--text-muted)] outline-none"/>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-1">
            <button
            v-for="row in visibleRows"
            :key="row.node.id"

            @click="selectNode(row.node)"

            class="flex w-full items-center gap-1 rounded-[4px] py-1 pr-2 text-left text-xs hover:bg-[var(--surface)]"

            :class="{
                'bg-[var(--surface)]': selectedId === row.node.id
            }"

            :style="{
                paddingLeft: `${6 + row.depth * 12}px`
            }"
        >
    <span class="w-3">

                <ChevronRight
                    v-if="row.hasChildren"
                    class="h-3 w-3 transition-transform"
                    :class="{
                        'rotate-90': row.expanded
                    }"
                />

            </span>



            <FolderOpen
                v-if="row.node.type === 'folder' && row.expanded"

                class="h-3.5 w-3.5 text-[var(--accent)]"
            />


            <Folder
                v-else-if="row.node.type === 'folder'"

                class="h-3.5 w-3.5 text-[var(--text-muted)]"
            />


            <FileVideo
                v-else

                class="h-3.5 w-3.5 text-[var(--text-muted)]"
            />



            <span class="truncate flex-1">

                {{ row.node.name }}

            </span>



            <span
                v-if="row.node.type === 'file'"
                class="font-mono text-[10px] text-[var(--text-muted)]"
            >

                {{ statusSymbol(row.node.status) }}

            </span></button>
        </div>

        <div class="border-t border-[var(--border-strong)] px-3 py-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)]"></div>
    </div>
</template>