import { Mixer } from './Mixer.js';

export class Timeline {
    constructor() {
        this.clips = new Map(); 
        this.currentTime = 0;
    }

    addClip(clipID, animation) {
        const clip = {
            id: clipID,
            animation: animation,
            startTime: 0,
            duration: animation.duration,
            weight: 1.0,
            boneWeights: new Map()
        };
        this.clips.set(clipID, clip);
    }

    removeClip(clipID) {
        this.clips.delete(clipID);
    }

    applyAt(time, rootNode) {
        this.currentTime = time;

        // 筛选活跃片段
        const activeClips = [];
        for (const clip of this.clips.values()) {
            if (time >= clip.startTime && time < (clip.startTime + clip.duration)) {
                activeClips.push(clip);
            }
        }

        if (activeClips.length === 0) return;

        const finalPose = Mixer.blendMultiple(activeClips, time);
        this._applyToNodes(rootNode, finalPose);
    }

    _applyToNodes(node, finalPose) {
    if (finalPose.has(node.name)) {
        const trs = finalPose.get(node.name);
        if (trs.pos) node.position = trs.pos;
        if (trs.quat) node.quaternion = trs.quat;
        if (trs.scale) node.scale = trs.scale;
        node.setDirty();
    }
        for (const child of node.children) {
            this._applyToNodes(child, finalPose);
        }
    }
}