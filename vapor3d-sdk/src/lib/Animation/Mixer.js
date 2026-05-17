import { Math3D } from '../index';

export class Mixer {
    static blendMultiple(activeTracks, globalTime) {
        const finalPose = new Map();

        for (const track of activeTracks) {
            const localTime = globalTime - track.startTime;
            const sampledPose = track.animation.sample(localTime);

            for (const [nodeName, trs] of sampledPose) {
                // 手动骨骼权重
                const bWeight = track.boneWeights && track.boneWeights.has(nodeName)
                    ? track.boneWeights.get(nodeName) : 1.0;

                const effectiveWeight = track.weight * bWeight;
                if (effectiveWeight <= 0) continue;

                // 过滤无动作骨骼
                let isIdentity = true;
                if (trs.position) {
                    if (Math.abs(trs.position[0]) > 0.001 ||
                        Math.abs(trs.position[1]) > 0.001 ||
                        Math.abs(trs.position[2]) > 0.001) isIdentity = false;
                }
                if (isIdentity && trs.quaternion) {
                    if (Math.abs(Math.abs(trs.quaternion[3]) - 1.0) > 0.001) isIdentity = false;
                }
                if (isIdentity) continue;

                if (!finalPose.has(nodeName)) {
                    finalPose.set(nodeName, {
                        pos: trs.position ? [...trs.position] : [0, 0, 0],
                        quat: trs.quaternion ? [...trs.quaternion] : [0, 0, 0, 1],
                        scale: trs.scale ? [...trs.scale] : [1, 1, 1],
                        weightSum: effectiveWeight
                    });
                } else {
                    const current = finalPose.get(nodeName);
                    const totalWeight = current.weightSum + effectiveWeight;
                    const alpha = effectiveWeight / totalWeight;

                    if (trs.position) current.pos = Math3D.vec3_lerp(current.pos, trs.position, alpha);
                    if (trs.quaternion) current.quat = Math3D.quat_slerp(current.quat, trs.quaternion, alpha);
                    if (trs.scale) current.scale = Math3D.vec3_lerp(current.scale, trs.scale, alpha);

                    current.weightSum = totalWeight;
                }
            }
        }
        return finalPose;
    }
}