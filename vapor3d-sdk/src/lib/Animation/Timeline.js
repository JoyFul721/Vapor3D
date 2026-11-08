// /lib/Timeline.js

import { Mixer } from "./Mixer.js";

export const PLAY_MODES = new Set(['hold', 'disappear', 'loop']);
export const CLIP_MODES = new Set(['normal', 'additive']);

// hold 采样末帧时避免踩到动画右边界
const FRAME_EPSILON = 1e-6;

export class Clip {
    constructor(name, animation, mode, { startTime, trimStart, trimEnd }) {
        this.name = name;
        this.animation = animation;
        this.mode = mode;

        this.startTime = startTime;
        this.trimStart = trimStart;
        this.trimEnd = trimEnd;

        this.playMode = 'disappear';
        this.weight = 1;
        this.boneWeights = new Map();
    }

    // 只读派生值
    get duration() {
        return this.trimEnd - this.trimStart;
    }
}

export class Timeline {
    constructor(type, target, options = {}) {
        this.type = type;
        this.target = target;
        this.clips = new Map();
        this.registryIndex = -1;
    }


    addClip(name, animation, mode = 'normal', options = {}) {
        if (!name || !animation) return false;
        if (this.clips.has(name)) return false;
        if (!CLIP_MODES.has(mode)) return false;

        const animDuration = Number(animation.duration);
        if (!Number.isFinite(animDuration) || animDuration <= 0) return false;

        const startTime = Number(options.startTime ?? 0);
        if (!Number.isFinite(startTime) || startTime < 0) return false;

        this.clips.set(name, new Clip(name, animation, mode, {
            startTime,
            trimStart: 0,
            trimEnd: animDuration
        }));
        return true;
    }

    removeClip(name) {
        return this.clips.delete(name);
    }


    setClipStartTime(name, startTime) {
        const clip = this.clips.get(name);
        if (!clip) return false;

        const t = Number(startTime);
        if (!Number.isFinite(t) || t < 0) return false;

        clip.startTime = t;
        return true;
    }

    // 双端裁剪
    setClipRange(name, trimStart, trimEnd) {
        const clip = this.clips.get(name);
        if (!clip) return false;

        const max = Number(clip.animation.duration);
        const s = Number(trimStart);
        const e = Number(trimEnd);

        if (!Number.isFinite(s) || !Number.isFinite(e)) return false;
        if (s < 0 || e > max) return false;
        if (!(s < e)) return false;

        clip.trimStart = s;
        clip.trimEnd = e;
        return true;
    }

    setClipPlayMode(name, playMode) {
        const clip = this.clips.get(name);
        if (!clip || !PLAY_MODES.has(playMode)) return false;
        clip.playMode = playMode;
        return true;
    }

    setClipWeight(name, weight) {
        const clip = this.clips.get(name);
        if (!clip) return false;

        const w = Number(weight);
        if (!Number.isFinite(w) || w < 0) return false;

        clip.weight = w;
        return true;
    }

    setClipJointWeight(name, jointName, weight, recursive = false) {
        const clip = this.clips.get(name);
        if (!clip) return false;

        const w = Number(weight);
        if (!Number.isFinite(w) || w < 0) return false;

        const joint = this._findJoint(jointName);
        if (!joint) return false;

        if (recursive) {
            this._applyWeightRecursive(joint, clip.boneWeights, w);
        } else {
            clip.boneWeights.set(joint.name, w);
        }
        return true;
    }


    getClipDuration(name) {
        const clip = this.clips.get(name);
        return clip ? clip.duration : 0;
    }

    isActiveAt(time) {
        const t = Number(time);
        if (!Number.isFinite(t)) return false;

        for (const clip of this.clips.values()) {
            if (this.isClipActive(clip, t)) return true;
        }
        return false;
    }

    isClipActive(clip, time) {
        const local = time - clip.startTime;
        if (local < 0) return false;

        const period = clip.trimEnd - clip.trimStart;
        if (period <= 0) return false;

        if (local < period) return true;

        return clip.playMode === 'hold' || clip.playMode === 'loop';
    }

    // 本地时间 -> 动画时间
    getSampleTime(clip, time) {
        const local = time - clip.startTime;
        const period = clip.trimEnd - clip.trimStart;

        if (local < period) {
            return clip.trimStart + local;
        }

        if (clip.playMode === 'loop') {
            return clip.trimStart + (local % period);
        }


        return Math.max(clip.trimStart, clip.trimEnd - FRAME_EPSILON);
    }


    applyAt(time) {
        const t = Number(time);
        if (!Number.isFinite(t)) return false;

        // 筛选活跃片段
        const activeClips = [];
        for (const clip of this.clips.values()) {
            if (this.isClipActive(clip, t)) activeClips.push(clip);
        }
        if (activeClips.length === 0) return false;

        const pose = Mixer.blendMultiple(
            activeClips,
            t,
            (clip, globalTime) => this.getSampleTime(clip, globalTime)
        );

        return this._applyPose(pose);
    }

    _applyPose(pose) {
        if (!pose || pose.size === 0) return false;

        if (this.type === 'skeleton') {
            if (!this._writeJoints(this.target.joints ?? [], pose)) return false;
            this._markDirty(this.target);
            return true;
        }

        let any = false;
        for (const skel of this.target.skeletons ?? []) {
            if (this._writeJoints(skel.joints ?? [], pose)) {
                this._markDirty(skel);
                any = true;
            }
        }
        return any;
    }
    _writeJoints(joints, pose) {
        let changed = false;
        for (const joint of joints) {
            const trs = pose.get(joint.name);
            if (!trs) continue;

            joint.position = trs.pos;
            joint.quaternion = trs.quat;
            joint.scale = trs.scale;
            changed = true;
        }
        return changed;
    }
    _markDirty(node) {
        if (node && typeof node.setDirty === 'function') node.setDirty();
    }


    _findJoint(name) {
        if (this.type === 'skeleton') {
            const joints = this.target.joints ?? [];
            return joints.find(j => j.name === name) ?? null;
        }

        const skeletons = this.target.skeletons ?? [];
        for (const skel of skeletons) {
            const joint = (skel.joints ?? []).find(j => j.name === name);
            if (joint) return joint;
        }
        return null;
    }

    _applyWeightRecursive(node, weightMap, weight) {
        weightMap.set(node.name, weight);
        for (const child of node.children ?? []) {
            this._applyWeightRecursive(child, weightMap, weight);
        }
    }
}