// /handlers/Timeline_h.js

import { Timeline } from "../lib";

export class TimelineHandlers {
    constructor(registry) {
        this.registry = registry;
        this.timelinesMap = new Map();
    }

    Timeline_Create({ NAME, TYPE, TARGET_INDEX }) {
        const target = this.registry.get(TYPE === 'skeleton' ? 'skeletons' : 'containers', TARGET_INDEX);
        if (!target) return -1;
        const timeline = new Timeline(TYPE, target);
        const index = this.registry.allocate('timelines', timeline);
        timeline.registryIndex = index;
        this.timelinesMap.set(NAME, index);
        return index;
    }

    Timeline_Destroy({ INDEX }) {
        const index = Number(INDEX);
        this.registry.dispose('timelines', index);
        // 清理映射
        for (const [name, idx] of this.timelinesMap) {
            if (idx === index) {
                this.timelinesMap.delete(name);
                break;
            }
        }
    }

    Timeline_AddClip({ INDEX, CLIP_NAME, ANIMATION_INDEX, MODE }) {
        const timeline = this.registry.get('timelines', INDEX);
        const animation = this.registry.get('animations', ANIMATION_INDEX);
        if (timeline && animation) timeline.addClip(CLIP_NAME, animation, MODE);
    }

    Timeline_SetClipProperty({ INDEX, CLIP_NAME, PROP, VALUE }) {
        const timeline = this.registry.get('timelines', INDEX);
        const clip = timeline?.clips.get(CLIP_NAME);
        if (clip && PROP in clip) {
            clip[PROP] = Number(VALUE);
        }
    }

    Timeline_SetClipBoneWeight({ INDEX, CLIP_NAME, BONE_NAME, WEIGHT, RECURSIVE }) {
        const timeline = this.registry.get('timelines', INDEX);
        const clip = timeline?.clips.get(CLIP_NAME);
        if (!timeline || !clip) return;

        // 如果是 Skeleton 直接找，如果是 Container 则遍历内部所有 Skeleton
        let targetJoint = null;
        if (timeline.type === 'skeleton') {
            targetJoint = timeline.target.joints.find(j => j.name === BONE_NAME);
        } else {
            for (const skel of timeline.target.skeletons) {
                targetJoint = skel.joints.find(j => j.name === BONE_NAME);
                if (targetJoint) break;
            }
        }

        if (targetJoint) {
            if (RECURSIVE === "true") {
                this._setBoneWeightRecursive(targetJoint, clip.boneWeights, Number(WEIGHT));
            } else {
                clip.boneWeights.set(targetJoint.name, Number(WEIGHT));
            }
        }
    }

    _setBoneWeightRecursive(node, weightMap, weight) {
        weightMap.set(node.name, weight);
        for (const child of node.children) this._setBoneWeightRecursive(child, weightMap, weight);
    }

    Timeline_IsActive({ INDEX, TIME }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return false;
        return Array.from(timeline.clips.values()).some(c =>
            TIME >= c.startTime && TIME < (c.startTime + c.duration)
        );
    }

    Timeline_ApplyAt({ INDEX, TIME }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return;
        const root = timeline.type === 'skeleton' ? timeline.target.joints[0].parent : timeline.target.rootNode;
        timeline.applyAt(Number(TIME), root);
    }
}