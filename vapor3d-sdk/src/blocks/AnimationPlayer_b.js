export const AnimationPlayerBlocks = [
    { blockType: "label", text: "Track" },
    {
        opcode: "Animation_AddTrack", // 创建新轨道
        blockType: "command",
        text: "Scene [SCENE_ID] model [PATH] add track [TRACK_NAME]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "animation" },
            TRACK_NAME: { type: "string", defaultValue: "Base" }
        }
    },
    {
        opcode: "Animation_RemoveTrack", // 删除轨道
        blockType: "command",
        text: "Scene [SCENE_ID] model [PATH] remove track [TRACK_NAME]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "animation" },
            TRACK_NAME: { type: "string", defaultValue: "Base" }
        }
    },
    {
        opcode: "Animation_ClearTracks", // 清空所有
        blockType: "command",
        text: "Scene [SCENE_ID] model [PATH] clear all tracks",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "animation" }
        }
    },
    { blockType: "label", text: "Clip" },
    {
        opcode: "Animation_AddClip",
        blockType: "command",
        text: "Scene [SCENE_ID] model [PATH] add clip [ANIM_NAME] to track [TRACK_NAME] at [START]s duration [DURATION]s weight [WEIGHT]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "animation" },
            ANIM_NAME: { type: "string", defaultValue: "Walk" },
            TRACK_NAME: { type: "string", defaultValue: "Base" },
            START: { type: "number", defaultValue: 0 },
            DURATION: { type: "number", defaultValue: 2 },
            WEIGHT: { type: "number", defaultValue: 1 }
        }
    },
    {
        opcode: "Animation_SetClipBoneWeight",
        blockType: "command",
        text: "In Scene [SCENE_ID] model [PATH] clip [ANIM_NAME] ([TRACK_NAME]) set bone [BONE_NAME] weight to [WEIGHT] (recursive [RECURSIVE])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "animation" },
            ANIM_NAME: { type: "string", defaultValue: "Injury" },
            TRACK_NAME: { type: "string", defaultValue: "Base" },
            BONE_NAME: { type: "string", defaultValue: "Spine" },
            WEIGHT: { type: "number", defaultValue: 0 },
            RECURSIVE: { type: "string", menu: "yesNoMenu" } // 使用菜单让用户选“是/否”
        }
    },
    {
        opcode: "Animation_ApplyTime", // 设置指针
        blockType: "command",
        text: "Set Scene [SCENE_ID] animation time to [TIME]s",
        arguments: { SCENE_ID: { type: "string", defaultValue: "Main" },  TIME: { type: "number", defaultValue: 0 } }
    },


    "---",
    {
        opcode: "Animation_GetNodeTRS",
        blockType: "reporter",
        text: "Scene [SCENE_ID] node [PATH] get current TRS",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "animation" }
        }
    },
    {
        opcode: "Animation_GetModelJointTRS",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [MODEL] .joints [IDX] get current TRS",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" },
            IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Animation_GetTrackCount",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [PATH] get tracks count",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "animation" }
        }
    },
    {
        opcode: "Animation_IsTimelineActive",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [PATH] is timeline active?",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "animation" }
        }
    }
];