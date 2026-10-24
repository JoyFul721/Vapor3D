export const TimelineBlocks = [
    {
        opcode: "Timeline_Create",
        blockType: "reporter",
        text: "new Timeline ([NAME]) type: [TYPE] target: [TARGET_INDEX]",
        arguments: {
            NAME: { type: "string", defaultValue: "Timeline1" },
            TYPE: {
                type: "string",
                menu: "targetTypeMenu",
                defaultValue: "skeleton"
            },
            TARGET_INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Timeline_Destroy",
        blockType: "command",
        text: "Timeline [INDEX] .destroy()",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },


    {
        opcode: "Timeline_AddClip",
        blockType: "command",
        text: "Timeline [INDEX] .addClip ([CLIP_NAME]) anim: [ANIMATION_INDEX] mode: [MODE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            ANIMATION_INDEX: { type: "number", defaultValue: 0 },
            MODE: { type: "string", menu: "clipMode" }
        }
    },

    {
        opcode: "Timeline_SetClipProperty",
        blockType: "command",
        text: "Timeline [INDEX] .clip [CLIP_NAME] set [PROP] to [VALUE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            PROP: { type: "string", menu: "clipPropMenu" },
            VALUE: { type: "number", defaultValue: 1 }
        }
    },
    {
        opcode: "Timeline_SetClipBoneWeight",
        blockType: "command",
        text: "Timeline [INDEX] .clip [CLIP_NAME] bone [BONE_NAME] weight: [WEIGHT] recursive: [RECURSIVE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            BONE_NAME: { type: "string", defaultValue: "Root" },
            WEIGHT: { type: "number", defaultValue: 1 },
            RECURSIVE: { type: "string", menu: "yesNoMenu" }
        }
    },
    {
        opcode: "Timeline_IsActive",
        blockType: "reporter",
        text: "Timeline [INDEX] is active at [TIME]?",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            TIME: { type: "number", defaultValue: 0 }
        }
    },

    {
        opcode: "Timeline_ApplyAt",
        blockType: "command",
        text: "Timeline [INDEX] .applyAt (time: [TIME])",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            TIME: { type: "number", defaultValue: 0 }
        }
    }
];