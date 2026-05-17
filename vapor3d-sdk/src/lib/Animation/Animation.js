import { Math3D } from '../index';


export class Animation {
    constructor(name, channels, samplers) {
        this.name = name;
        this.channels = channels; // { sampler, targetNode, path }
        this.samplers = samplers; // { input, output, interpolation }
        this.duration = 0;

        // Calculate the total duration of the animation
        if (this.samplers.length > 0) {
            for (const sampler of this.samplers) {
                const lastTime = sampler.input[sampler.input.length - 1];
                if (lastTime > this.duration) {
                    this.duration = lastTime;
                }
            }
        }
    }

    _getFrameIndices(times, time) {
        if (time <= times[0]) return { prev: 0, next: 0, t: 0 };
        if (time >= times[times.length - 1]) return { prev: times.length - 1, next: times.length - 1, t: 0 };

        let prev = 0;
        for (let i = 1; i < times.length; i++) {
            if (times[i] >= time) {
                prev = i - 1;
                break;
            }
        }
        const next = prev + 1;
        const frameDuration = times[next] - times[prev];
        const t = frameDuration > 0 ? (time - times[prev]) / frameDuration : 0;

        return { prev, next, t };
    }

    /**
     * 在特定时间点采样整个动画的所有节点状态
     * @returns {Map<string, {position, quaternion, scale}>}
     */
    sample(time) {
        const results = new Map();

        for (const channel of this.channels) {
            const sampler = this.samplers[channel.sampler];
            const nodeName = channel.targetNode.name;

            if (!results.has(nodeName)) {
                results.set(nodeName, { position: null, quaternion: null, scale: null });
            }
            const state = results.get(nodeName);
            const { prev, next, t } = this._getFrameIndices(sampler.input, time);

            // 根据 channel path 填充 TRS
            if (channel.path === 'translation') {
                const prevVal = sampler.output.subarray(prev * 3, prev * 3 + 3);
                const nextVal = sampler.output.subarray(next * 3, next * 3 + 3);
                state.position = (sampler.interpolation === 'STEP') ? [...prevVal] : Math3D.vec3_lerp(prevVal, nextVal, t);
            } else if (channel.path === 'rotation') {
                const prevVal = sampler.output.subarray(prev * 4, prev * 4 + 4);
                const nextVal = sampler.output.subarray(next * 4, next * 4 + 4);
                state.quaternion = (sampler.interpolation === 'STEP') ? [...prevVal] : Math3D.quat_slerp(prevVal, nextVal, t);
            } else if (channel.path === 'scale') {
                const prevVal = sampler.output.subarray(prev * 3, prev * 3 + 3);
                const nextVal = sampler.output.subarray(next * 3, next * 3 + 3);
                state.scale = (sampler.interpolation === 'STEP') ? [...prevVal] : Math3D.vec3_lerp(prevVal, nextVal, t);
            }
        }
        return results;
    }
}