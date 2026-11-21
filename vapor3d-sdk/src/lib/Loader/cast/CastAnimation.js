// /lib/Loader/CastAnimation.js

import { Animation } from '../../Animation/Animation.js';
import { toVaporVec3, toVaporQuat, toVaporScale } from './CastCoords.js';

function asArray(value) {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
}

function toNumberArray(value) {
    if (value === undefined || value === null) return null;
    const out = asArray(value).map(Number);
    return out.every(Number.isFinite) ? out : null;
}

/**
 * 把 cast anim -> Vapor Animation
 *
 * @param {Array} animNodes   workspace.ofType('anim')
 * @param {TransformNode[]} joints  骨骼节点
 * @param {Map<string, number>} boneByName 骨骼名-> 索引
 * @returns {Animation[]}
 */
export function buildCastAnimations(animNodes, joints, boneByName, fallbackPrefix = "cast") {
    const result = [];

    animNodes.forEach((animNode, index) => {
        const props = animNode.properties;
        const fps = Number(props.fr) || 30;
        const name = String(props.n ?? props.nn ?? `${fallbackPrefix}_anim${index}`);

        const byBone = new Map();
        for (const curve of animNode.children) {
            if (curve.type !== "curv") continue;

            const cp = curve.properties;
            const boneIndex = boneByName.get(String(cp.nn ?? "").toLowerCase());
            if (boneIndex === undefined) continue;

            const channel = String(cp.kp ?? "");
            if (channel === "") continue;

            if (!byBone.has(boneIndex)) byBone.set(boneIndex, {});
            byBone.get(boneIndex)[channel] = {
                frames: asArray(cp.kb).map(Number),
                values: asArray(cp.kv),
            };
        }

        const channels = [];
        const samplers = [];
        let restRelative = false;

        const addChannel = (joint, path, input, output) => {
            if (input.length === 0) return;
            samplers.push({
                input: new Float32Array(input),
                output: new Float32Array(output),
                interpolation: "LINEAR",
            });
            channels.push({ sampler: samplers.length - 1, targetNode: joint, path });
        };

        // 各轴关键帧取并集；缺帧沿用上一帧的值
        const unionFrames = (parts) => {
            const set = new Set();
            for (const part of parts) {
                if (!part) continue;
                for (const frame of part.frames) set.add(frame);
            }
            return [...set].sort((a, b) => a - b);
        };

        const sampleAxis = (part, frame, fallback) => {
            if (!part) return fallback;
            let value = fallback;
            for (let i = 0; i < part.frames.length; i++) {
                if (part.frames[i] > frame) break;
                const raw = part.values[i];
                const n = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
                if (Number.isFinite(n)) value = n;
            }
            return value;
        };

        for (const [boneIndex, data] of byBone) {
            const joint = joints[boneIndex];
            if (!joint) continue;

            if (data.rq && data.rq.frames.length > 0) {
                const input = [];
                const output = [];
                for (let i = 0; i < data.rq.frames.length; i++) {
                    const q = toNumberArray(data.rq.values[i]);
                    if (!q || q.length < 4) continue;
                    input.push(data.rq.frames[i] / fps);
                    output.push(...toVaporQuat(q));
                }
                addChannel(joint, "rotation", input, output);
            }

            // cast 的 tx/ty/tz 是相对静止姿态的偏移（curv.m = "relative"），
            // 保持增量存储，普通混合时由 Mixer 叠加静止姿态，additive 时直接当增量用
            const { tx, ty, tz } = data;
            if (tx || ty || tz) {
                const frames = unionFrames([tx, ty, tz]);
                const input = [];
                const output = [];
                for (const frame of frames) {
                    const p = toVaporVec3([
                        sampleAxis(tx, frame, 0),
                        sampleAxis(ty, frame, 0),
                        sampleAxis(tz, frame, 0),
                    ]);
                    input.push(frame / fps);
                    output.push(p[0], p[1], p[2]);
                }
                addChannel(joint, "translation", input, output);
                restRelative = true;
            }

            const { sx, sy, sz } = data;
            if (sx || sy || sz) {
                const frames = unionFrames([sx, sy, sz]);
                const input = [];
                const output = [];
                for (const frame of frames) {
                    const s = toVaporScale([
                        sampleAxis(sx, frame, 1),
                        sampleAxis(sy, frame, 1),
                        sampleAxis(sz, frame, 1),
                    ]);
                    input.push(frame / fps);
                    output.push(s[0], s[1], s[2]);
                }
                addChannel(joint, "scale", input, output);
            }
        }

        // marker：anim 下同时带 kb(帧) 与 n(名称) 的子节点
        const markers = [];
        for (const child of animNode.children) {
            const cp = child.properties;
            if (cp.kb === undefined || cp.n === undefined) continue;
            for (const frame of asArray(cp.kb)) {
                const f = Number(frame);
                if (!Number.isFinite(f)) continue;
                markers.push({ name: String(cp.n), time: f / fps });
            }
        }
        markers.sort((a, b) => a.time - b.time);

        const animation = new Animation(name, channels, samplers, markers);
        // 位移是相对静止姿态的增量，由 Mixer 在普通混合时叠加参考姿态
        animation.restRelative = restRelative;
        if (animation.duration === 0 && markers.length > 0) {
            animation.duration = markers[markers.length - 1].time;
        }

        result.push(animation);
    });

    return result;
}
