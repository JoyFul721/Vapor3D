// /lib/Animation/Timeline.js

import { Mixer } from "./Mixer";
import { Math3D } from "../Tools/Math3D.js";

function toFinite(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function isValidTRS(t, q, s) {
    return (
        Array.isArray(t) && t.length === 3 && t.every(Number.isFinite) &&
        Array.isArray(q) && q.length === 4 && q.every(Number.isFinite) &&
        Array.isArray(s) && s.length === 3 && s.every(Number.isFinite)
    );
}

export class Timeline {
    constructor(type, target) {
        this.type = type; // 'container' | 'skeleton'
        this.target = target;
        this.clips = new Map(); // clip name -> Clip
        this.registryIndex = -1;

        // Read-only bind-time pose (T-pose), keyed by node
        this._bindPoseByNode = this._captureBindPose();
        this._bindPose = this._toNameMap(this._bindPoseByNode);
        // Blending reference pose, starts as bindPose, replaceable via setRestPoseFromCurrent
        this._basePoseByNode = this._bindPoseByNode;
        this._basePose = this._bindPose;
    }

    /** Blending reference pose used by Mixer */
    get restPose() {
        return this._basePose;
    }

    /** Bind-time pose, immutable */
    get bindPose() {
        return this._bindPose;
    }

    // Mixer looks poses up by node name, so it needs a name-keyed view
    _toNameMap(nodeMap) {
        const map = new Map();
        for (const [node, trs] of nodeMap) map.set(node.name, trs);
        return map;
    }

    _captureBindPose() {
        return this._captureBindPoseFromSkeleton() ?? this._captureCurrentPose();
    }

    /**
     * 从 inverseBindMatrices 反推 bind pose
     * world = inverse(IBM)，local = inverse(parentWorld) * world
     * IBM 是否包含骨骼链外的父级由 skeleton.bindSpaceIncludesAncestors 决定
     */
    _captureBindPoseFromSkeleton() {
        if (this.type !== "skeleton") return null;

        const joints = this.target?.joints ?? [];
        const ibms = this.target?.inverseBindMatrices;
        if (joints.length === 0 || !ibms || ibms.length < joints.length * 16) return null;

        // glTF: IBM is the inverse of the joint's full world matrix, ancestors included.
        // CAST: IBM is built from the joint chain only, ancestors excluded.
        const includesAncestors = this.target?.bindSpaceIncludesAncestors !== false;

        const bindWorld = new Map();
        for (let i = 0; i < joints.length; i++) {
            bindWorld.set(
                joints[i],
                Math3D.mat4_inverse(ibms.subarray(i * 16, i * 16 + 16)),
            );
        }

        const worldCache = new Map();
        const worldOf = (node, depth = 0) => {
            if (!node || depth > 256) return Math3D.mat4_identity;
            const bind = bindWorld.get(node);
            if (bind) return bind;
            // Ancestors are not part of the bind space: they must not contribute
            if (!includesAncestors) return Math3D.mat4_identity;
            const cached = worldCache.get(node);
            if (cached) return cached;

            const local = Math3D.mat4_fromRTS(node.quaternion, node.position, node.scale);
            const world = node.parent
                ? Math3D.mat4_multiply(worldOf(node.parent, depth + 1), local)
                : local;
            worldCache.set(node, world);
            return world;
        };

        const pose = new Map();
        for (const joint of joints) {
            const world = bindWorld.get(joint);
            const local = joint.parent
                ? Math3D.mat4_multiply(Math3D.mat4_inverse(worldOf(joint.parent)), world)
                : world;
            const { t, q, s } = Math3D.mat4_decompose(local);
            if (!isValidTRS(t, q, s)) return null;
            pose.set(joint, { position: t, quaternion: q, scale: s });
        }
        return pose.size > 0 ? pose : null;
    }

    _captureCurrentPose() {
        const pose = new Map();
        const visit = (node) => {
            if (!node) return;
            pose.set(node, {
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
        return pose;
    }

    /** Snapshot the current node pose as the new blending reference */
    setRestPoseFromCurrent() {
        this._basePoseByNode = this._captureCurrentPose();
        this._basePose = this._toNameMap(this._basePoseByNode);
        return true;
    }

    /** Roll the blending reference back to the bind pose (T-pose) */
    setRestPoseFromBind() {
        this._basePoseByNode = this._bindPoseByNode;
        this._basePose = this._bindPose;
        return true;
    }

    /** Write the reference pose back to the joints/nodes immediately; clip state untouched */
    applyRestPose() {
        const pose = this._basePoseByNode;
        if (!pose || pose.size === 0) return false;

        for (const [node, trs] of pose) {
            const changed =
                node.position !== trs.position ||
                node.quaternion !== trs.quaternion ||
                node.scale !== trs.scale;
            if (changed) {
                node.position = trs.position;
                node.quaternion = trs.quaternion;
                node.scale = trs.scale;
                node.setDirty();
            }
        }
        return true;
    }

    /** @deprecated Use setRestPoseFromCurrent / applyRestPose to express intent */
    resetRestPose() {
        return this.setRestPoseFromCurrent();
    }

    addClip(clip) {
        if (!clip || typeof clip.isActive !== "function") return false;

        const existing = this.clips.get(clip.name);
        if (existing === clip) return true;
        if (existing) existing.timelines?.delete(this);

        this.clips.set(clip.name, clip);
        clip.timelines?.add(this);
        return true;
    }

    removeClip(clipOrName) {
        const clip = typeof clipOrName === "string"
            ? this.clips.get(clipOrName)
            : clipOrName;

        if (!clip || this.clips.get(clip.name) !== clip) return false;

        this.clips.delete(clip.name);
        clip.timelines?.delete(this);
        return true;
    }

    getClip(name) {
        return this.clips.get(name) ?? null;
    }

    getClipAt(position) {
        const i = Number(position);
        if (!Number.isInteger(i) || i < 0) return null;
        return Array.from(this.clips.values())[i] ?? null;
    }

    getClipCount() {
        return this.clips.size;
    }

    getClipNames() {
        return Array.from(this.clips.keys());
    }

    setAllClipTimes(time) {
        const t = toFinite(time);
        for (const clip of this.clips.values()) clip.setTime(t);
    }

    advanceAllClipTimes(delta) {
        const dt = toFinite(delta);
        for (const clip of this.clips.values()) clip.advanceTime(dt);
    }

    getDuration() {
        let duration = 0;
        for (const clip of this.clips.values()) {
            if (!clip.alive) continue;
            duration = Math.max(duration, clip.duration);
        }
        return duration;
    }

    getActiveClips() {
        const active = [];
        for (const clip of this.clips.values()) {
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

    /*
    只要 finalPose 里存在该骨骼，就会覆盖节点上的值，因此"从一个空基座推出来的值"
    在这里是破坏性的。Mixer 必须在把通道写进 finalPose 之前就对着参考姿态
    （reference pose）解析完毕，不能让不完整的值流转到这一步的 write-back
    */
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
        for (const clip of this.clips.values()) clip.timelines?.delete(this);
        this.clips.clear();
        this._basePose.clear();
        if (this._bindPose !== this._basePose) this._bindPose.clear();
        this._basePoseByNode.clear();
        if (this._bindPoseByNode !== this._basePoseByNode) this._bindPoseByNode.clear();
        this._basePose = new Map();
        this._bindPose = this._basePose;
        this._basePoseByNode = new Map();
        this._bindPoseByNode = this._basePoseByNode;
    }
}