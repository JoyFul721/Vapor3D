// /lib/Animation/Timeline.js

import { Mixer } from "./Mixer";

function toFinite(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

export class Timeline {
    constructor(type, target) {
        this.type = type; // 'container' | 'skeleton'
        this.target = target;
        this.clips = new Set();
        this.registryIndex = -1;
        this.restPose = this._captureRestPose();
    }

    _captureRestPose() {
        const rest = new Map();
        const visit = (node) => {
            if (!node) return;
            rest.set(node.name, {
                position: [...node.position],
                quaternion: [...node.quaternion],
                scale: [...node.scale],
            });
            for (const child of node.children ?? []) visit(child);
        };

        if (this.type === "skeleton") {
            for (const joint of this.target?.joints ?? []) visit(joint);
        } else {
            visit(this.target?.rootNode);
        }
        return rest;
    }

    resetRestPose() {
        this.restPose = this._captureRestPose();
    }

    addClip(clip) {
        if (!clip || typeof clip.isActive !== "function") return false;
        if (this.clips.has(clip)) return true;

        this.clips.add(clip);
        clip.timelines?.add(this);
        return true;
    }

    removeClip(clipOrIndex) {
        const clip = typeof clipOrIndex === "number"
            ? this.getClip(clipOrIndex)
            : clipOrIndex;

        if (!clip || !this.clips.has(clip)) return false;

        this.clips.delete(clip);
        clip.timelines?.delete(this);
        return true;
    }

    getClip(index) {
        const i = Number(index);
        for (const clip of this.clips) {
            if (clip.registryIndex === i) return clip;
        }
        return null;
    }

    getClipByName(name) {
        for (const clip of this.clips) {
            if (clip.name === name) return clip;
        }
        return null;
    }

    getClipAt(position) {
        const i = Number(position);
        if (!Number.isInteger(i) || i < 0) return null;
        return Array.from(this.clips)[i] ?? null;
    }

    getClipCount() {
        return this.clips.size;
    }

    getClipNames() {
        return Array.from(this.clips, clip => clip.name);
    }

    setAllClipTimes(time) {
        const t = toFinite(time);
        for (const clip of this.clips) clip.setTime(t);
    }

    advanceAllClipTimes(delta) {
        const dt = toFinite(delta);
        for (const clip of this.clips) clip.advanceTime(dt);
    }

    getDuration() {
        let duration = 0;
        for (const clip of this.clips) {
            if (!clip.alive) continue;
            duration = Math.max(duration, clip.duration);
        }
        return duration;
    }

    getActiveClips() {
        const active = [];
        for (const clip of this.clips) {
            if (clip.isActive()) active.push(clip);
        }
        return active;
    }

    apply() {
        const activeClips = this.getActiveClips();
        if (activeClips.length === 0) return;

        const finalPose = Mixer.blendMultiple(activeClips, this.restPose);

        if (this.type === "skeleton") {
            this._applyToSkeleton(finalPose);
        } else if (this.type === "container") {
            this._applyToContainer(finalPose);
        }
    }

    _applyToSkeleton(finalPose) {
        // Skeleton 直接遍历 target.joints
        this._applyToNodes(this.target.joints, finalPose);
    }

    _applyToContainer(finalPose) {
        // Container 从 rootNode 开始递归
        this._applyToNodes([this.target.rootNode], finalPose);
    }

    _applyToNodes(nodes, finalPose) {
        for (const node of nodes) {
            if (finalPose.has(node.name)) {
                const trs = finalPose.get(node.name);
                if (trs.pos) node.position = trs.pos;
                if (trs.quat) node.quaternion = trs.quat;
                if (trs.scale) node.scale = trs.scale;
                node.setDirty();
            }
            if (node.children) this._applyToNodes(node.children, finalPose);
        }
    }

    destroy() {
        for (const clip of this.clips) clip.timelines?.delete(this);
        this.clips.clear();
        this.restPose.clear();
    }
}