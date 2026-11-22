// /lib/Animation/Mixer.js

import { Math3D } from '../Tools/Math3D.js';

function clipLocalTime(clip) {
    const time = Number(clip.time);
    return Number.isFinite(time) ? time : 0;
}

function fadeFactor(clip, localTime) {
    let factor = 1;
    if (clip.fadeIn > 0) factor = Math.min(factor, localTime / clip.fadeIn);
    if (clip.fadeOut > 0) {
        factor = Math.min(factor, (clip.duration - localTime) / clip.fadeOut);
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
        const finalPose = new Map();
        const normalClips = activeClips.filter(c => c.mode !== 'additive');
        const additiveClips = activeClips.filter(c => c.mode === 'additive');

        for (const clip of normalClips) {
            const localTime = clipLocalTime(clip);
            const fade = fadeFactor(clip, localTime);
            if (fade <= 0) continue;

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
                    if (!p.pos) {
                        p.pos = [...trs.position];
                        p.posW = w;
                    } else {
                        const a = w / (p.posW + w);
                        p.pos = Math3D.vec3_lerp(p.pos, trs.position, a);
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

                if (trs.position) {
                    p.pos = Math3D.vec3_add(p.pos ?? [0, 0, 0], Math3D.vec3_scale(trs.position, w));
                }
                if (trs.quaternion) {
                    p.quat = Math3D.quat_multiply(
                        p.quat ?? [0, 0, 0, 1],
                        Math3D.quat_slerp([0, 0, 0, 1], trs.quaternion, Math.min(w, 1)),
                    );
                }
                if (trs.scale) {
                    p.scale = Math3D.vec3_mul(p.scale ?? [1, 1, 1], [
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