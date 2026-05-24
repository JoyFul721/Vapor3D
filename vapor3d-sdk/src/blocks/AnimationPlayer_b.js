export const AnimationPlayerBlocks = [
    { blockType: "label", text: "Clip" },
    {
        opcode: "Animation_AddClip",
        blockType: "command",
        text: "Scene [SCENE_ID] model [MODEL] create clip [CLIP_ID] ( [ANIM_NAME] )",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" },
            CLIP_ID: { type: "string", defaultValue: "walk_layer" },
            ANIM_NAME: { type: "string", defaultValue: "Walk" }
        }
    },
    {
        opcode: "Animation_SetClipProperty",
        blockType: "command",
        text: "Scene [SCENE_ID] model [MODEL] clips [CLIP_ID] .set([PROP], [VALUE])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" },
            CLIP_ID: { type: "string", defaultValue: "walk_layer" },
            PROP: { type: "string", menu: "clipPropMenu" }, // startTime, duration, weight
            VALUE: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Animation_RemoveClip",
        blockType: "command",
        text: "Scene [SCENE_ID] model [MODEL] clips [CLIP_ID] .remove()",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" },
            CLIP_ID: { type: "string", defaultValue: "walk_layer" }
        }
    },
    {
        opcode: "Animation_ClearClips",
        blockType: "command",
        text: "Scene [SCENE_ID] .models [MODEL] .clearAllClips()",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" }
        }
    },
    {
        opcode: "Animation_SetClipBoneWeight",
        blockType: "command",
        text: "Scene [SCENE_ID] model [MODEL] clips [CLIP_ID] .setBoneWeight([BONE_NAME], [WEIGHT], [RECURSIVE])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" },
            CLIP_ID: { type: "string", defaultValue: "walk_layer" },
            BONE_NAME: { type: "string", defaultValue: "Spine" },
            WEIGHT: { type: "number", defaultValue: 0 },
            RECURSIVE: { type: "string", menu: "yesNoMenu" }
        }
    },
    {
        opcode: "Animation_ApplyTime",
        blockType: "command",
        text: "Scene [SCENE_ID] .animationTime = [TIME]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            TIME: { type: "number", defaultValue: 0 }
        }
    },


    "---",
    {
        opcode: "Animation_GetNodeTRS",
        blockType: "reporter",
        text: "Scene [SCENE_ID] node [MODEL] get current TRS",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" }
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
        text: "Scene [SCENE_ID] model [MODEL] get tracks count",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" }
        }
    },
    {
        opcode: "Animation_IsTimelineActive",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [MODEL] is timeline active?",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" }
        }
    }
];