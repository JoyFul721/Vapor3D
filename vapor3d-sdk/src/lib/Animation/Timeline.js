import { Mixer } from './Mixer.js';

export class Timeline {
    constructor() {
        this.tracks = new Map();
        this.currentTime = 0;
    }

    addClip(trackName, animation, startTime, duration, weight) {
        if (!this.tracks.has(trackName)) {
            this.tracks.set(trackName, []);
        }
        const clip = {
            animation,
            startTime,
            duration,
            weight,
            boneWeights: new Map() // 存储每根骨骼的独立权重，实现骨骼 Mask
        };
        this.tracks.get(trackName).push(clip);
    }

    applyAt(time, rootNode) {
        this.currentTime = time;
        const activeClips = [];

        for (const [trackName, clips] of this.tracks) {
            for (const clip of clips) {
                if (time >= clip.startTime && time < (clip.startTime + clip.duration)) {
                    activeClips.push(clip);
                }
            }
        }

        if (activeClips.length === 0) return;

        // 调用 Mixer 得到混合后的 Map
        const finalPose = Mixer.blendMultiple(activeClips, time);

        // 递归写入
        this._applyToNodes(rootNode, finalPose);
    }

    _applyToNodes(node, finalPose) {
        if (finalPose.has(node.name)) {
            const trs = finalPose.get(node.name);
            // 将 Mixer 计算的结果写回 Node 属性
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