const TimelineCoreBlocks = [
    {
        opcode: "Timeline_Create",
        blockType: "reporter",
        text: "new Timeline [NAME] type [TYPE] target [TARGET_INDEX]",
        arguments: {
            NAME: { type: "string", defaultValue: "timeline" },
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
    { blockType: "label", text: "Timeline Clips" },
    {
        opcode: "Timeline_AddClip",
        blockType: "command",
        text: "Timeline [INDEX] .addClip [CLIP_INDEX]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Timeline_RemoveClip",
        blockType: "command",
        text: "Timeline [INDEX] .removeClip [CLIP_INDEX]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CLIP_INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Timeline_GetClipCount",
        blockType: "reporter",
        text: "Timeline [INDEX] .clipCount",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Timeline_GetClipAt",
        blockType: "reporter",
        text: "Timeline [INDEX] .clipAt [POSITION]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            POSITION: { type: "number", defaultValue: 1 }
        }
    },
    { blockType: "label", text: "Timeline Playback" },
    {
        opcode: "Timeline_SetAllClipTimes",
        blockType: "command",
        text: "Timeline [INDEX] .setAllClipTimes [TIME]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            TIME: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Timeline_AdvanceAllClipTimes",
        blockType: "command",
        text: "Timeline [INDEX] .advanceAllClipTimes [DELTA]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            DELTA: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Timeline_GetClip",
        blockType: "reporter",
        text: "Timeline [INDEX] .getClip [NAME]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            NAME: { type: "string", defaultValue: "clip" }
        }
    },
    {
        opcode: "Timeline_GetDuration",
        blockType: "reporter",
        text: "Timeline [INDEX] .duration",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Timeline_Apply",
        blockType: "command",
        text: "Timeline [INDEX] .apply",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    }
];

export const ClipBlocks = [
    { blockType: "label", text: "Clip" },
    {
        opcode: "Clip_Create",
        blockType: "reporter",
        text: "new Clip [NAME] anim [ANIMATION_INDEX] mode [MODE]",
        arguments: {
            NAME: { type: "string", defaultValue: "clip" },
            ANIMATION_INDEX: { type: "number", defaultValue: 0 },
            MODE: { type: "string", menu: "clipMode", defaultValue: "normal" }
        }
    },
    {
        opcode: "Clip_Destroy",
        blockType: "command",
        text: "Clip [INDEX] .destroy",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },
    { blockType: "label", text: "Clip Timing" },
    {
        opcode: "Clip_SetTrim",
        blockType: "command",
        text: "Clip [INDEX] .trim start [START] end [END]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            START: { type: "number", defaultValue: 0 },
            END: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Clip_SetFade",
        blockType: "command",
        text: "Clip [INDEX] .fade in [FADE_IN] out [FADE_OUT]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            FADE_IN: { type: "number", defaultValue: 0 },
            FADE_OUT: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Clip_SetEnabled",
        blockType: "command",
        text: "Clip [INDEX] .setEnabled [ENABLED]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            ENABLED: { type: "string", menu: "boolMenu", defaultValue: "true" }
        }
    },
    {
        opcode: "Clip_SetMode",
        blockType: "command",
        text: "Clip [INDEX] .setMode [MODE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            MODE: { type: "string", menu: "clipMode", defaultValue: "normal" }
        }
    },
    {
        opcode: "Clip_SetTime",
        blockType: "command",
        text: "Clip [INDEX] .setTime [TIME]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            TIME: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Clip_AdvanceTime",
        blockType: "command",
        text: "Clip [INDEX] .advanceTime [DELTA]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            DELTA: { type: "number", defaultValue: 0 }
        }
    },
    { blockType: "label", text: "Clip Properties" },
    {
        opcode: "Clip_SetProperty",
        blockType: "command",
        text: "Clip [INDEX] .set [PROP] [VALUE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            PROP: { type: "string", menu: "clipPropMenu" },
            VALUE: { type: "number", defaultValue: 1 }
        }
    },
    {
        opcode: "Clip_GetProperty",
        blockType: "reporter",
        text: "Clip [INDEX] .get [PROP]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            PROP: { type: "string", menu: "clipInfoMenu" }
        }
    },
    { blockType: "label", text: "Clip Marker" },
    {
        opcode: "Clip_GetMarkerTime",
        blockType: "reporter",
        text: "Clip [INDEX] .markerTime [NAME]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            NAME: { type: "string", defaultValue: "marker" }
        }
    },
    {
        opcode: "Clip_GetMarkerAt",
        blockType: "reporter",
        text: "Clip [INDEX] .markerAt [TIME]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            TIME: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Clip_GetMarkerNames",
        blockType: "reporter",
        text: "Clip [INDEX] .markerNames",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Clip_GetMarkerCount",
        blockType: "reporter",
        text: "Clip [INDEX] .markerCount",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },
    { blockType: "label", text: "Clip Joint" },
    {
        opcode: "Clip_SetJointWeight",
        blockType: "command",
        text: "Clip [INDEX] .Joint [JOINT_NAME] setWeight [WEIGHT] recursive [RECURSIVE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            JOINT_NAME: { type: "string", defaultValue: "spine" },
            WEIGHT: { type: "number", defaultValue: 1 },
            RECURSIVE: { type: "string", menu: "boolMenu", defaultValue: "false" }
        }
    }
];

export const TimelineBlocks = [...TimelineCoreBlocks, ...ClipBlocks];