// /handlers/Timeline_h.js

import { Timeline, Clip } from "../lib";

export class TimelineHandlers {
    constructor(registry) {
        this.registry = registry;
        this.timelinesMap = new Map();
        this.clipsMap = new Map();
    }

    _getTimeline(index) {
        const i = Number(index);
        if (!Number.isInteger(i) || i < 0) return null;
        return this.registry?.get("timelines", i) ?? null;
    }

    _getClip(index) {
        const i = Number(index);
        if (!Number.isInteger(i) || i < 0) return null;
        return this.registry?.get("clips", i) ?? null;
    }

    Timeline_Create({ NAME, TYPE, TARGET_INDEX }) {
        if (!this.registry) return -1;
        const target = this.registry.get(
            TYPE === "skeleton" ? "skeletons" : "containers",
            Number(TARGET_INDEX),
        );
        if (!target) return -1;
        const timeline = new Timeline(TYPE, target);
        const index = this.registry.allocate("timelines", timeline);
        timeline.registryIndex = index;
        this.timelinesMap.set(NAME, index);
        return index;
    }

    Timeline_Destroy({ INDEX }) {
        const index = Number(INDEX);
        if (!Number.isInteger(index) || index < 0) return;
        this.registry.dispose("timelines", index);
        // 清理映射
        for (const [name, idx] of this.timelinesMap) {
            if (idx === index) {
                this.timelinesMap.delete(name);
                break;
            }
        }
    }

    Timeline_AddClip({ INDEX, CLIP_INDEX }) {
        const timeline = this._getTimeline(INDEX);
        const clip = this._getClip(CLIP_INDEX);
        if (!timeline || !clip) return;
        timeline.addClip(clip);
    }

    Timeline_RemoveClip({ INDEX, CLIP_INDEX }) {
        const timeline = this._getTimeline(INDEX);
        const clip = this._getClip(CLIP_INDEX);
        if (!timeline || !clip) return;
        timeline.removeClip(clip);
    }

    Timeline_GetClipCount({ INDEX }) {
        const timeline = this._getTimeline(INDEX);
        return timeline ? timeline.getClipCount() : 0;
    }

    Timeline_GetClipAt({ INDEX, POSITION }) {
        const timeline = this._getTimeline(INDEX);
        if (!timeline) return -1;
        const clip = timeline.getClipAt(Number(POSITION) - 1);
        return clip ? clip.registryIndex : -1;
    }

    Timeline_GetDuration({ INDEX }) {
        const timeline = this._getTimeline(INDEX);
        return timeline ? timeline.getDuration() : 0;
    }

    Timeline_SetAllClipTimes({ INDEX, TIME }) {
        const timeline = this._getTimeline(INDEX);
        if (!timeline) return;
        timeline.setAllClipTimes(TIME);
    }

    Timeline_AdvanceAllClipTimes({ INDEX, DELTA }) {
        const timeline = this._getTimeline(INDEX);
        if (!timeline) return;
        timeline.advanceAllClipTimes(DELTA);
    }

    Timeline_Apply({ INDEX }) {
        const timeline = this._getTimeline(INDEX);
        if (!timeline) return;
        timeline.apply();
    }

    Clip_Create({ NAME, ANIMATION_INDEX, MODE }) {
        if (!this.registry) return -1;
        const animation = this.registry.get("animations", Number(ANIMATION_INDEX));
        if (!animation) return -1;

        const clip = new Clip(NAME, animation, MODE);
        const index = this.registry.allocate("clips", clip);
        clip.registryIndex = index;
        this.clipsMap.set(NAME, index);
        return index;
    }

    Clip_Destroy({ INDEX }) {
        const index = Number(INDEX);
        if (!Number.isInteger(index) || index < 0) return;
        this.registry.dispose("clips", index);
        for (const [name, idx] of this.clipsMap) {
            if (idx === index) {
                this.clipsMap.delete(name);
                break;
            }
        }
    }

    Clip_SetProperty({ INDEX, PROP, VALUE }) {
        const clip = this._getClip(INDEX);
        if (!clip) return;
        clip.setProperty(PROP, VALUE);
    }

    Clip_GetProperty({ INDEX, PROP }) {
        const clip = this._getClip(INDEX);
        return clip ? clip.getProperty(PROP) : 0;
    }

    Clip_SetMode({ INDEX, MODE }) {
        const clip = this._getClip(INDEX);
        if (!clip) return;
        clip.setMode(MODE);
    }

    Clip_SetTrim({ INDEX, START, END }) {
        const clip = this._getClip(INDEX);
        if (!clip) return;
        clip.setTrim(START, END);
    }

    Clip_SetFade({ INDEX, FADE_IN, FADE_OUT }) {
        const clip = this._getClip(INDEX);
        if (!clip) return;
        clip.setFade(FADE_IN, FADE_OUT);
    }

    Clip_SetEnabled({ INDEX, ENABLED }) {
        const clip = this._getClip(INDEX);
        if (!clip) return;
        clip.setProperty("enabled", ENABLED);
    }

    Clip_SetTime({ INDEX, TIME }) {
        const clip = this._getClip(INDEX);
        if (!clip) return;
        clip.setTime(TIME);
    }

    Clip_AdvanceTime({ INDEX, DELTA }) {
        const clip = this._getClip(INDEX);
        if (!clip) return;
        clip.advanceTime(DELTA);
    }

    Clip_GetTime({ INDEX }) {
        const clip = this._getClip(INDEX);
        return clip ? clip.time : 0;
    }

    Clip_IsActive({ INDEX }) {
        const clip = this._getClip(INDEX);
        return clip ? clip.isActive() : false;
    }

    Clip_GetDuration({ INDEX }) {
        const clip = this._getClip(INDEX);
        return clip ? clip.duration : 0;
    }

    Clip_GetName({ INDEX }) {
        const clip = this._getClip(INDEX);
        return clip ? clip.name : "";
    }

    Clip_SetJointWeight({ INDEX, JOINT_NAME, WEIGHT, RECURSIVE }) {
        const clip = this._getClip(INDEX);
        if (!clip) return;
        clip.setJointWeight(JOINT_NAME, Number(WEIGHT), RECURSIVE === "true");
    }
}