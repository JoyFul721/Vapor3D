// /lib/Animation/Mixer.js

import { Math3D } from '../Tools/Math3D.js';

function clipLocalTime(clip) {
    const time = Number(clip.time);
    return Number.isFinite(time) ? time : 0;
}

function fadeFactor(clip, localTime) {
    const duration = Number(clip.duration);

    // A zero-length clip is a constant pose: fade in/out has no range to run over
    if (!(duration > 0)) return 1;

    let factor = 1;
    if (clip.fadeIn > 0) factor = Math.min(factor, localTime / clip.fadeIn);
    if (clip.fadeOut > 0) {
        factor = Math.min(factor, (duration - localTime) / clip.fadeOut);
    }
    return Math.min(1, Math.max(0, factor));
}

function isIdentity(trs) {
    if (trs.position && trs.position.some(v => Math.abs(v) > 0.001)) return false;
    if (trs.quaternion && Math.abs(Math.abs(trs.quaternion[3]) - 1) > 0.001) return false;
    if (trs.scale && trs.scale.some(v => Math.abs(v - 1) > 0.001)) return false;
    return true;
}

export class Mixer {
    static blendMultiple(activeClips, restPose = null) {
        // Ascending blendOrder; stable sort keeps timeline insertion order for ties
        const ordered = [...activeClips].sort(
            (a, b) => (Number(a.blendOrder) || 0) - (Number(b.blendOrder) || 0),
        );

        const finalPose = new Map();
        const normalClips = ordered.filter(c => c.mode !== 'additive');
        const additiveClips = ordered.filter(c => c.mode === 'additive');

        for (const clip of normalClips) {
            const localTime = clipLocalTime(clip);
            const fade = fadeFactor(clip, localTime);
            if (fade <= 0) continue;

            // 位移相对静止姿态存储的动画（如 CAST），普通混合时叠加参考姿态
            const restRelative = clip.animation.restRelative === true;

            const pose = clip.animation.sample((clip.trimStart ?? 0) + localTime);
            for (const [name, trs] of pose) {
                const bw = clip.boneWeights?.has(name) ? clip.boneWeights.get(name) : 1;
                const w = clip.weight * bw * fade;
                if (w <= 0) continue;

                let p = finalPose.get(name);
                if (!p) {
                    p = { pos: null, quat: null, scale: null, posW: 0, quatW: 0, scaleW: 0 };
                    finalPose.set(name, p);
                }

                if (trs.position) {
                    const position = restRelative
                        ? Math3D.vec3_add(restPose?.get(name)?.position ?? [0, 0, 0], trs.position)
                        : trs.position;

                    if (!p.pos) {
                        p.pos = [...position];
                        p.posW = w;
                    } else {
                        const a = w / (p.posW + w);
                        p.pos = Math3D.vec3_lerp(p.pos, position, a);
                        p.posW += w;
                    }
                }

                if (trs.quaternion) {
                    if (!p.quat) {
                        p.quat = [...trs.quaternion];
                        p.quatW = w;
                    } else {
                        const a = w / (p.quatW + w);
                        p.quat = Math3D.quat_slerp(p.quat, trs.quaternion, a);
                        p.quatW += w;
                    }
                }

                if (trs.scale) {
                    if (!p.scale) {
                        p.scale = [...trs.scale];
                        p.scaleW = w;
                    } else {
                        const a = w / (p.scaleW + w);
                        p.scale = Math3D.vec3_lerp(p.scale, trs.scale, a);
                        p.scaleW += w;
                    }
                }
            }
        }

        // A normal pose whose total influence is below 1 only covers part of
        // the way from the rest pose. This is what makes fades work on a clip
        // that is the only normal clip driving a bone.
        if (restPose) {
            for (const [name, p] of finalPose) {
                const rest = restPose.get(name);
                if (!rest) continue;

                if (p.pos && p.posW < 1) {
                    p.pos = Math3D.vec3_lerp(rest.position, p.pos, p.posW);
                }
                if (p.quat && p.quatW < 1) {
                    p.quat = Math3D.quat_slerp(rest.quaternion, p.quat, p.quatW);
                }
                if (p.scale && p.scaleW < 1) {
                    p.scale = Math3D.vec3_lerp(rest.scale, p.scale, p.scaleW);
                }
            }
        }

        for (const clip of additiveClips) {
            const localTime = clipLocalTime(clip);
            const fade = fadeFactor(clip, localTime);
            if (fade <= 0) continue;

            const pose = clip.animation.sample((clip.trimStart ?? 0) + localTime);
            for (const [name, trs] of pose) {
                const bw = clip.boneWeights?.has(name) ? clip.boneWeights.get(name) : 1;
                const w = clip.weight * bw * fade;
                if (w <= 0) continue;
                if (isIdentity(trs)) continue;

                let p = finalPose.get(name);
                if (!p) {
                    p = { pos: null, quat: null, scale: null };
                    finalPose.set(name, p);
                }

                /*
                pos/quat/scale 是三个独立通道，null 表示没有任何 clip 决定过这个通道
                一个坑：以前 additive 把 null 当成原点，导致丢掉骨骼的静止位置，最终写回的
                就成了纯增量，整条骨骼链会被平移出去

                现在缺通道会回落到参考姿态，与叠加到当前值语义一致，
                只有连参考姿态都没有时才退化为原点
                */
                const rest = restPose?.get(name);

                if (trs.position) {
                    p.pos = Math3D.vec3_add(
                        p.pos ?? rest?.position ?? [0, 0, 0],
                        Math3D.vec3_scale(trs.position, w),
                    );
                }
                if (trs.quaternion) {
                    p.quat = Math3D.quat_multiply(
                        p.quat ?? rest?.quaternion ?? [0, 0, 0, 1],
                        Math3D.quat_slerp([0, 0, 0, 1], trs.quaternion, Math.min(w, 1)),
                    );
                }
                if (trs.scale) {
                    p.scale = Math3D.vec3_mul(p.scale ?? rest?.scale ?? [1, 1, 1], [
                        1 + (trs.scale[0] - 1) * w,
                        1 + (trs.scale[1] - 1) * w,
                        1 + (trs.scale[2] - 1) * w,
                    ]);
                }
            }
        }

        for (const p of finalPose.values()) {
            delete p.posW;
            delete p.quatW;
            delete p.scaleW;
        }
        return finalPose;
    }
}