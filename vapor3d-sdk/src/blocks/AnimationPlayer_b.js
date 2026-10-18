// /blocks/AnimationPlayer_b.js

export const AnimationPlayerBlocks = [
    {
        opcode: "Animation_AddClip",
        blockType: "command",
        text: "Skeleton [SKELETON_INDEX] add clip ([CLIP_ID]) animation ([ANIMATION_INDEX])",
        arguments: {
            SKELETON_INDEX: { type: "number", defaultValue: 0 },
            CLIP_ID: { type: "string", defaultValue: "walk" },
            ANIMATION_INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Animation_SetClipProperty",
        blockType: "command",
        text: "Skeleton [SKELETON_INDEX] clip [CLIP_ID] .set([PROP], [VALUE])",
        arguments: {
            SKELETON_INDEX: { type: "number", defaultValue: 0 },
            CLIP_ID: { type: "string", defaultValue: "walk" },
            PROP: { type: "string", menu: "clipPropMenu", defaultValue: "weight" }, // 支持 startTime, duration, weight 等
            VALUE: { type: "number", defaultValue: 1.0 }
        }
    },
    {
        opcode: "Animation_RemoveClip",
        blockType: "command",
        text: "Skeleton [SKELETON_INDEX] clip [CLIP_ID] .remove()",
        arguments: {
            SKELETON_INDEX: { type: "number", defaultValue: 0 },
            CLIP_ID: { type: "string", defaultValue: "walk" }
        }
    },
    {
        opcode: "Animation_ClearClips",
        blockType: "command",
        text: "Skeleton [SKELETON_INDEX] .clearAllClips()",
        arguments: {
            SKELETON_INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Animation_SetClipBoneWeight",
        blockType: "command",
        text: "Skeleton [SKELETON_INDEX] clip [CLIP_ID] .setBoneWeight([BONE_NAME], [WEIGHT], [RECURSIVE])",
        arguments: {
            SKELETON_INDEX: { type: "number", defaultValue: 0 },
            CLIP_ID: { type: "string", defaultValue: "walk" },
            BONE_NAME: { type: "string", defaultValue: "Spine" },
            WEIGHT: { type: "number", defaultValue: 1.0 },
            RECURSIVE: { type: "string", menu: "yesNoMenu", defaultValue: "false" }
        }
    },
    {
        opcode: "Animation_ApplyTime",
        blockType: "command",
        text: "Skeleton [SKELETON_INDEX] .applyTime([TIME])",
        arguments: {
            SKELETON_INDEX: { type: "number", defaultValue: 0 },
            TIME: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Animation_GetTrackCount",
        blockType: "reporter",
        text: "Animation [ANIMATION_INDEX] .getTrackCount()",
        arguments: {
            ANIMATION_INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Animation_IsTimelineActive",
        blockType: "reporter",
        text: "Skeleton [SKELETON_INDEX] .isTimelineActive()",
        arguments: {
            SKELETON_INDEX: { type: "number", defaultValue: 0 }
        }
    }
];