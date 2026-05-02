import { Math3D } from './Math3D.js';


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
     * @param {number} time - The current animation time.
     */
    apply(time) {
        for (const channel of this.channels) {
            const sampler = this.samplers[channel.sampler];
            const targetNode = channel.targetNode;

            if (!sampler || !targetNode) continue;

            const { prev, next, t } = this._getFrameIndices(sampler.input, time);

            switch (channel.path) {
                case 'translation': {
                    const prevVal = sampler.output.subarray(prev * 3, prev * 3 + 3);
                    if (sampler.interpolation === 'STEP') {
                        targetNode.position = [...prevVal];
                    } else { // LINEAR
                        const nextVal = sampler.output.subarray(next * 3, next * 3 + 3);
                        targetNode.position = Math3D.vec3_lerp(prevVal, nextVal, t);
                    }
                    targetNode.setDirty();
                    break;
                }
                case 'rotation': {
                    const prevVal = sampler.output.subarray(prev * 4, prev * 4 + 4);
                    if (sampler.interpolation === 'STEP') {
                        targetNode.quaternion = [...prevVal];
                    } else { // LINEAR
                        const nextVal = sampler.output.subarray(next * 4, next * 4 + 4);
                        targetNode.quaternion = Math3D.quat_slerp(prevVal, nextVal, t);
                    }
                    targetNode.setDirty();
                    break;
                }
                case 'scale': {
                    const prevVal = sampler.output.subarray(prev * 3, prev * 3 + 3);
                    if (sampler.interpolation === 'STEP') {
                        targetNode.scale = [...prevVal];
                    } else { // LINEAR
                        const nextVal = sampler.output.subarray(next * 3, next * 3 + 3);
                        targetNode.scale = Math3D.vec3_lerp(prevVal, nextVal, t);
                    }
                    targetNode.setDirty();
                    break;
                }
            }
        }
    }
}