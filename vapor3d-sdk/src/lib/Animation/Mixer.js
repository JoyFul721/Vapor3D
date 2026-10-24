// /lib/Animation/Mixer.js

import { Math3D } from '../index';

export class Mixer {
    static blendMultiple(activeClips, globalTime) {
        const finalPose = new Map();
        const normalClips = activeClips.filter(c => c.mode !== 'additive');
        const additiveClips = activeClips.filter(c => c.mode === 'additive');

        for (const clip of normalClips) {
            const pose = clip.animation.sample(globalTime - clip.startTime);
            for (const [name, trs] of pose) {
                const bw = clip.boneWeights?.has(name) ? clip.boneWeights.get(name) : 1;
                const w = clip.weight * bw;
                if (w <= 0) continue;

                let identity = true;
                if (trs.position && trs.position.some(v => Math.abs(v) > 0.001)) identity = false;
                if (identity && trs.quaternion && Math.abs(Math.abs(trs.quaternion[3]) - 1) > 0.001) identity = false;
                if (identity && trs.scale && trs.scale.some(v => Math.abs(v - 1) > 0.001)) identity = false;
                if (identity) continue;

                const p = finalPose.get(name);
                if (!p) {
                    finalPose.set(name, { pos: trs.position ? [...trs.position] : [0, 0, 0], quat: trs.quaternion ? [...trs.quaternion] : [0, 0, 0, 1], scale: trs.scale ? [...trs.scale] : [1, 1, 1], weightSum: w });
                } else {
                    const a = w / (p.weightSum + w);
                    if (trs.position) p.pos = Math3D.vec3_lerp(p.pos, trs.position, a);
                    if (trs.quaternion) p.quat = Math3D.quat_slerp(p.quat, trs.quaternion, a);
                    if (trs.scale) p.scale = Math3D.vec3_lerp(p.scale, trs.scale, a);
                    p.weightSum += w;
                }
            }
        }

        for (const clip of additiveClips) {
            const pose = clip.animation.sample(globalTime - clip.startTime);
            for (const [name, trs] of pose) {
                const bw = clip.boneWeights?.has(name) ? clip.boneWeights.get(name) : 1;
                const w = clip.weight * bw;
                if (w <= 0) continue;

                let identity = true;
                if (trs.position && trs.position.some(v => Math.abs(v) > 0.001)) identity = false;
                if (identity && trs.quaternion && Math.abs(Math.abs(trs.quaternion[3]) - 1) > 0.001) identity = false;
                if (identity && trs.scale && trs.scale.some(v => Math.abs(v - 1) > 0.001)) identity = false;
                if (identity) continue;

                const p = finalPose.get(name) ?? { pos: [0, 0, 0], quat: [0, 0, 0, 1], scale: [1, 1, 1], weightSum: 0 };
                if (trs.position) p.pos = Math3D.vec3_add(p.pos, Math3D.vec3_scale(trs.position, w));
                if (trs.quaternion) p.quat = Math3D.quat_multiply(p.quat, Math3D.quat_slerp([0, 0, 0, 1], trs.quaternion, Math.min(w, 1)));
                if (trs.scale) p.scale = Math3D.vec3_mul(p.scale, [1 + (trs.scale[0] - 1) * w, 1 + (trs.scale[1] - 1) * w, 1 + (trs.scale[2] - 1) * w]);
                finalPose.set(name, p);
            }
        }

        for (const p of finalPose.values()) delete p.weightSum;
        return finalPose;
    }
}