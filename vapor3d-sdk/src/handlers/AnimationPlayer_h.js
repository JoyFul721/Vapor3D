// /handlers/AnimationPlayer_h.js

export class AnimationPlayerHandlers {
    constructor(engineHandlers, sceneHandlers, registry) {
        this.engine = engineHandlers;
        this.sceneHandlers = sceneHandlers;
        this.registry = registry ?? engineHandlers.registry;
    }

    _get(type, index) {
        const i = Number(index);
        if (!Number.isInteger(i) || i < 0) return null;
        return this.registry?.get(type, i) ?? null;
    }

    _getSkeleton(index) {
        return this._get("skeletons", index);
    }

    _getAnimation(index) {
        return this._get("animations", index);
    }

    _getTimeline(skeletonIndex) {
        const skeleton = this._getSkeleton(skeletonIndex);
        if (!skeleton) return null;
        if (!skeleton.timeline) {
            // skeleton 自身持有 timeline
            const { Timeline } = require("../lib/Animation/Timeline.js");
            skeleton.timeline = new Timeline();
        }
        return skeleton.timeline;
    }

    _getSkeletonRoot(skeleton) {
        return skeleton?.rootNode
            ?? skeleton?.root
            ?? skeleton?.joints?.[0]
            ?? null;
    }

    // ====================== Actions ======================

    Animation_ClearClips({ SKELETON_INDEX }) {
        const timeline = this._getTimeline(SKELETON_INDEX);
        if (timeline) {
            timeline.clips.clear();
        }
    }

    Animation_AddClip({ SKELETON_INDEX, CLIP_ID, ANIMATION_INDEX }) {
        const timeline = this._getTimeline(SKELETON_INDEX);
        const animation = this._getAnimation(ANIMATION_INDEX);

        if (timeline && animation) {
            timeline.addClip(CLIP_ID, animation);
        }
    }

    Animation_RemoveClip({ SKELETON_INDEX, CLIP_ID }) {
        const timeline = this._getTimeline(SKELETON_INDEX);
        timeline?.removeClip(CLIP_ID);
    }

    Animation_SetClipProperty({ SKELETON_INDEX, CLIP_ID, PROP, VALUE }) {
        const timeline = this._getTimeline(SKELETON_INDEX);
        const clip = timeline?.clips.get(CLIP_ID);
        if (clip) {
            clip[PROP] = Number(VALUE);
        }
    }

    Animation_SetClipBoneWeight({ SKELETON_INDEX, CLIP_ID, BONE_NAME, WEIGHT, RECURSIVE }) {
        const skeleton = this._getSkeleton(SKELETON_INDEX);
        const timeline = this._getTimeline(SKELETON_INDEX);
        const clip = timeline?.clips.get(CLIP_ID);

        if (!skeleton || !clip) return;

        let targetJoint = skeleton.joints?.find(j => j.name === BONE_NAME);
        if (!targetJoint) return;

        const weightVal = Number(WEIGHT);
        if (RECURSIVE === true || RECURSIVE === "true") {
            this._setBoneWeightRecursive(targetJoint, clip.boneWeights, weightVal);
        } else {
            clip.boneWeights.set(targetJoint.name, weightVal);
        }
    }

    _setBoneWeightRecursive(node, weightMap, weight) {
        weightMap.set(node.name, weight);
        for (const child of node.children ?? []) {
            this._setBoneWeightRecursive(child, weightMap, weight);
        }
    }

    Animation_ApplyTime({ SKELETON_INDEX, TIME }) {
        const skeleton = this._getSkeleton(SKELETON_INDEX);
        const timeline = this._getTimeline(SKELETON_INDEX);
        const root = this._getSkeletonRoot(skeleton);

        if (!skeleton || !timeline || !root) return;

        timeline.applyAt(Number(TIME), root);

        if (skeleton.sceneIndex != null && skeleton.sceneIndex >= 0) {
            const scene = this.sceneHandlers._getScene(skeleton.sceneIndex);
            if (scene) {
                skeleton.updateCPU(scene.worldMatrixBuffer);
                skeleton.updateGPU();
            }
        }
    }

    // ====================== Getters ======================

    _getFlatTRS(node) {
        if (!node) return [];
        return [
            ...node.position,
            ...node.quaternion,
            ...node.scale
        ];
    }

    Animation_GetSkeletonJointTRS({ SKELETON_INDEX, IDX }) {
        const skeleton = this._getSkeleton(SKELETON_INDEX);
        if (!skeleton || !skeleton.joints) return "[]";

        const jointNode = skeleton.joints[Number(IDX)];
        return jointNode ? JSON.stringify(this._getFlatTRS(jointNode)) : "[]";
    }

    Animation_GetTrackCount({ ANIMATION_INDEX }) {
        const animation = this._getAnimation(ANIMATION_INDEX);
        return animation?.tracks?.length ?? animation?.channels?.length ?? 0;
    }

    Animation_IsTimelineActive({ SKELETON_INDEX }) {
        const timeline = this._getTimeline(SKELETON_INDEX);
        if (!timeline) return false;

        return Array.from(timeline.clips.values()).some(t =>
            timeline.currentTime >= t.startTime && timeline.currentTime < (t.startTime + t.duration)
        );
    }
}