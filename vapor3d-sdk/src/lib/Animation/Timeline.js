// /lib/Animation/Timeline.js

import { Mixer } from "./Mixer";

export class Timeline {
    constructor(type, target) {
        this.type = type; // 'container' | 'skeleton'
        this.target = target;
        this.clips = new Map();
        this.currentTime = 0;
        this.registryIndex = -1;
    }

    addClip(clipID, animation, mode = 'normal') {
        const clip = {
            id: clipID,
            animation: animation,
            mode,
            startTime: 0,
            duration: animation.duration,
            weight: 1.0,
            boneWeights: new Map()
        };
        this.clips.set(clipID, clip);
    }

    applyAt(time) {
        this.currentTime = time;

        // 筛选活跃片段
        const activeClips = [];
        for (const clip of this.clips.values()) {
            if (this.currentTime >= clip.startTime && this.currentTime < (clip.startTime + clip.duration)) {
                activeClips.push(clip);
            }
        }

        if (activeClips.length === 0) return;

        const finalPose = Mixer.blendMultiple(activeClips, this.currentTime);

        if (this.type === 'skeleton') {
            this._applyToSkeleton(finalPose);
        } else if (this.type === 'container') {
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
}