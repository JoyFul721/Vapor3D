// --- START OF FILE Animation_b.js ---
export const AnimationPlayerBlocks = [
    {
        opcode: "Animation_Play",
        blockType: "command",
        text: "Scene [SCENE_ID] .nodes [PATH] play animation [ANIM_NAME] with mode [MODE]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "sample" },
            ANIM_NAME: { type: "string", defaultValue: "Walk" },
            MODE: { type: "string", menu: "playModeMenu" }
        }
    },
    {
        opcode: "Animation_Stop",
        blockType: "command",
        text: "Scene [SCENE_ID] .nodes [PATH] stop animation",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "sample" },
        }
    },
    {
        opcode: "Animation_SetTime",
        blockType: "command",
        text: "Scene [SCENE_ID] .nodes [PATH] set animation time to [TIME]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "sample" },
            TIME: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Animation_SetSpeed",
        blockType: "command",
        text: "Scene [SCENE_ID] .nodes [PATH] animation speed set to [SPEED]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "sample" },
            SPEED: { type: "number", defaultValue: 1 }
        }
    },
    {
        opcode: "Animation_Update",
        blockType: "command",
        text: "Update all animations in Scene [SCENE_ID] with delta time [DT]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            DT: { type: "number", defaultValue: 0.016 }
        }
    },
    "---",
    {
        opcode: "Animation_GetNodeTRS",
        blockType: "reporter",
        text: "Scene [SCENE_ID] .nodes [PATH] get current TRS",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "sample/Hips" }
        }
    },
    {
        opcode: "Animation_GetModelJointTRS",
        blockType: "reporter",
        text: "Scene [SCENE_ID] .nodes [MODEL] .joints [IDX] get current TRS",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Animation_GetInfo",
        blockType: "reporter",
        text: "Scene [SCENE_ID] .nodes [PATH] get animation [PARAM]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "sample" },
            PARAM: { type: "string", menu: "animInfoMenu" }
        }
    },
];