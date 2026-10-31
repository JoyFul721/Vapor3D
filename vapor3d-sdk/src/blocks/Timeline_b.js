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
        text: "Timeline [INDEX] .addClip [CLIP_NAME] anim [ANIMATION_INDEX] mode [MODE]",
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
        text: "Timeline [INDEX] .Clip [CLIP_NAME] .set [PROP] [VALUE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            PROP: { type: "string", menu: "clipPropMenu" },
            VALUE: { type: "number", defaultValue: 1 }
        }
    },
    {
        opcode: "Timeline_SetClipJointWeight",
        blockType: "command",
        text: "Timeline [INDEX] .Clip [CLIP_NAME] .Joint [JOINT_NAME] setWeight [WEIGHT] recursive [RECURSIVE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_NAME: { type: "string", defaultValue: "idle" },
            JOINT_NAME: { type: "string", defaultValue: "spine" },
            WEIGHT: { type: "number", defaultValue: 1 },
            RECURSIVE: { type: "string", menu: "boolMenu" }
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