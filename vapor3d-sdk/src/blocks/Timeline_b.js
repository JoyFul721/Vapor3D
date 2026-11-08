// /blocks/Timeline_b.js

export const TimelineBlocks = [
    {
        opcode: "Timeline_Create",
        blockType: "reporter",
        text: "new Timeline [NAME] type [TYPE] target [TARGET_INDEX]",
        arguments: {
            NAME: { type: "string", defaultValue: "Timeline1" },
            TYPE: { type: "string", menu: "targetTypeMenu", defaultValue: "skeleton" },
            TARGET_INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Timeline_Destroy",
        blockType: "command",
        text: "Timeline [INDEX] .destroy",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },


    {
        opcode: "Timeline_AddClip",
        blockType: "command",
        text: "Timeline [INDEX] .addClip [CLIP_NAME] anim [ANIMATION_INDEX] mode [MODE] start [START_TIME]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            ANIMATION_INDEX: { type: "number", defaultValue: 0 },
            MODE: { type: "string", menu: "clipMode", defaultValue: "normal" },
            START_TIME: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Timeline_RemoveClip",
        blockType: "command",
        text: "Timeline [INDEX] .removeClip [CLIP_NAME]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" }
        }
    },


    {
        opcode: "Timeline_SetClipStartTime",
        blockType: "command",
        text: "Timeline [INDEX] .clip [CLIP_NAME] startTime [START_TIME]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            START_TIME: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Timeline_SetClipRange",
        blockType: "command",
        text: "Timeline [INDEX] .clip [CLIP_NAME] trim [TRIM_START] [TRIM_END]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            TRIM_START: { type: "number", defaultValue: 0.0 },
            TRIM_END: { type: "number", defaultValue: 1.0 }
        }
    },
    {
        opcode: "Timeline_SetClipPlayMode",
        blockType: "command",
        text: "Timeline [INDEX] .clip [CLIP_NAME] playMode [PLAY_MODE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            PLAY_MODE: { type: "string", menu: "playModeMenu", defaultValue: "disappear" }
        }
    },
    {
        opcode: "Timeline_SetClipWeight",
        blockType: "command",
        text: "Timeline [INDEX] .clip [CLIP_NAME] weight [WEIGHT]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            WEIGHT: { type: "number", defaultValue: 1 }
        }
    },
    {
        opcode: "Timeline_SetClipJointWeight",
        blockType: "command",
        text: "Timeline [INDEX] .clip [CLIP_NAME] .joint [JOINT_NAME] setWeight [WEIGHT] recursive [RECURSIVE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            JOINT_NAME: { type: "string", defaultValue: "spine" },
            WEIGHT: { type: "number", defaultValue: 1 },
            RECURSIVE: { type: "string", menu: "boolMenu", defaultValue: "false" }
        }
    },


    {
        opcode: "Timeline_GetClipDuration",
        blockType: "reporter",
        text: "Timeline [INDEX] .clip [CLIP_NAME] duration",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" }
        }
    },
    {
        opcode: "Timeline_IsActive",
        blockType: "reporter",
        text: "Timeline [INDEX] .isActive [TIME]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            TIME: { type: "number", defaultValue: 0 }
        }
    },


    {
        opcode: "Timeline_ApplyAt",
        blockType: "command",
        text: "Timeline [INDEX] .applyAt [TIME]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            TIME: { type: "number", defaultValue: 0 }
        }
    }
];