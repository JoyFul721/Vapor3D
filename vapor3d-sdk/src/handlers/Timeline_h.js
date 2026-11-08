// /handlers/Timeline_h.js

import { Timeline } from "../lib";

export class TimelineHandlers {
    constructor(registry) {
        this.registry = registry;
        this.timelinesMap = new Map();
    }


    Timeline_Create({ NAME, TYPE, TARGET_INDEX }) {
        if (!this.registry) return -1;

        const target = this.registry.get(
            TYPE === 'skeleton' ? 'skeletons' : 'containers',
            TARGET_INDEX
        );
        if (!target) return -1;

        const timeline = new Timeline(TYPE, target);
        const index = this.registry.allocate('timelines', timeline);
        if (index < 0) return -1;

        timeline.registryIndex = index;
        this.timelinesMap.set(NAME, index);
        return index;
    }

    Timeline_Destroy({ INDEX }) {
        const index = Number(INDEX);
        if (!Number.isInteger(index) || index < 0) return;

        this.registry.dispose('timelines', index);
        // 清理映射
        for (const [name, idx] of this.timelinesMap) {
            if (idx === index) {
                this.timelinesMap.delete(name);
                break;
            }
        }
    }

    
    Timeline_AddClip({ INDEX, CLIP_NAME, ANIMATION_INDEX, MODE, START_TIME }) {
        const timeline = this.registry.get('timelines', INDEX);
        const animation = this.registry.get('animations', ANIMATION_INDEX);
        if (!timeline || !animation) return;

        timeline.addClip(CLIP_NAME, animation, String(MODE), {
            startTime: Number(START_TIME)
        });
    }

    Timeline_RemoveClip({ INDEX, CLIP_NAME }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return;
        timeline.removeClip(String(CLIP_NAME));
    }


    Timeline_SetClipStartTime({ INDEX, CLIP_NAME, START_TIME }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return;
        timeline.setClipStartTime(String(CLIP_NAME), Number(START_TIME));
    }

    Timeline_SetClipRange({ INDEX, CLIP_NAME, TRIM_START, TRIM_END }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return;
        timeline.setClipRange(
            String(CLIP_NAME),
            Number(TRIM_START),
            Number(TRIM_END)
        );
    }

    Timeline_SetClipPlayMode({ INDEX, CLIP_NAME, PLAY_MODE }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return;
        timeline.setClipPlayMode(String(CLIP_NAME), String(PLAY_MODE));
    }

    Timeline_SetClipWeight({ INDEX, CLIP_NAME, WEIGHT }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return;
        timeline.setClipWeight(String(CLIP_NAME), Number(WEIGHT));
    }

    Timeline_SetClipJointWeight({ INDEX, CLIP_NAME, JOINT_NAME, WEIGHT, RECURSIVE }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return;
        timeline.setClipJointWeight(
            String(CLIP_NAME),
            String(JOINT_NAME),
            Number(WEIGHT),
            RECURSIVE === true || RECURSIVE === 'true'
        );
    }


    Timeline_GetClipDuration({ INDEX, CLIP_NAME }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return 0;
        return timeline.getClipDuration(String(CLIP_NAME));
    }

    Timeline_IsActive({ INDEX, TIME }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return false;
        return timeline.isActiveAt(Number(TIME));
    }

    
    Timeline_ApplyAt({ INDEX, TIME }) {
        const timeline = this.registry.get('timelines', INDEX);
        if (!timeline) return;
        timeline.applyAt(Number(TIME));
    }
}