// /lib/Animation/Clip.js

const CLIP_MODES = new Set(["normal", "additive"]);
const MARKER_TOLERANCE = 1e-4;
const NUMERIC_CLIP_PROPS = new Set([
    "time",
    "trimStart",
    "trimEnd",
    "duration",
    "weight",
    "fadeIn",
    "fadeOut",
]);

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function toFinite(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

/**
 * 一条动画片段：把某个 Animation 映射到自己的播放区间上
 */
export class Clip {
    constructor(name, animation, mode = "normal") {
        this.name = name;
        this.id = name;
        this.animation = animation ?? null;
        this.mode = CLIP_MODES.has(mode) ? mode : "normal";

        this.time = 0; // Clip 本地播放头
        this.trimStart = 0; // 源动画左裁剪
        this.trimEnd = Math.max(0, toFinite(animation?.duration));
        this.weight = 1.0;
        this.fadeIn = 0;
        this.fadeOut = 0;
        this.enabled = true;

        this.boneWeights = new Map();
        this.timelines = new Set();
        this.alive = true;
        this.registryIndex = -1;
    }

    get duration() {
        return Math.max(0, this.trimEnd - this.trimStart);
    }

    setMode(mode) {
        if (!CLIP_MODES.has(mode)) return false;
        this.mode = mode;
        return true;
    }

    setProperty(prop, value) {
        if (prop === "enabled") {
            this.enabled =
                value === true || value === "true" || Number(value) === 1;
            return true;
        }

        if (prop === "mode") return this.setMode(value);
        if (!NUMERIC_CLIP_PROPS.has(prop)) return false;

        const n = Number(value);
        if (!Number.isFinite(n)) return false;

        switch (prop) {
            case "time":
                this.time = n;
                break;
            case "weight":
                this.weight = Math.max(0, n);
                break;
            case "fadeIn":
                this.fadeIn = Math.max(0, n);
                break;
            case "fadeOut":
                this.fadeOut = Math.max(0, n);
                break;
            case "trimStart":
                this.trimStart = clamp(n, 0, this.trimEnd);
                break;
            case "trimEnd":
                this.trimEnd = clamp(n, this.trimStart, this._maxTime());
                break;
            case "duration":
                this.trimEnd = clamp(
                    this.trimStart + Math.max(0, n),
                    this.trimStart,
                    this._maxTime(),
                );
                break;
            default:
                return false;
        }

        return true;
    }

    getProperty(prop) {
        if (prop === "name") return this.name;
        if (prop === "isActive") return this.isActive() ? 1 : 0;
        if (prop === "enabled") return this.enabled ? 1 : 0;
        if (prop === "mode") return this.mode;
        if (!NUMERIC_CLIP_PROPS.has(prop)) return 0;
        return prop === "duration" ? this.duration : this[prop];
    }

    setTrim(start, end) {
        const max = this._maxTime();
        if (!(max > 0)) return false;

        let trimStart = clamp(toFinite(start), 0, max);
        let trimEnd = toFinite(end, max);

        // END <= START means "play to the end of the source animation"
        if (!(trimEnd > trimStart)) trimEnd = max;

        trimStart = clamp(trimStart, 0, max);
        trimEnd = clamp(trimEnd, trimStart, max);

        this.trimStart = trimStart;
        this.trimEnd = trimEnd;
        return true;
    }

    setFade(fadeIn, fadeOut) {
        this.fadeIn = Math.max(0, toFinite(fadeIn));
        this.fadeOut = Math.max(0, toFinite(fadeOut));
        return true;
    }

    setTime(time) {
        this.time = toFinite(time);
        return true;
    }

    advanceTime(delta) {
        this.time += toFinite(delta);
        return true;
    }

    isActive() {
        return this.alive && this.enabled && this.duration > 0 &&
            this.time >= 0 && this.time < this.duration;
    }

    /*
    Marker：时间以 Clip 本地播放头为准
    被裁剪掉的区间内的 marker 不可见
    */

    get markers() {
        return this.animation?.markers ?? [];
    }

    getMarkerCount() {
        return this._markersInTrim().length;
    }

    getMarkerNames() {
        return this._markersInTrim().map(m => m.name);
    }

    getMarkerTime(name) {
        const marker = this._markersInTrim().find(m => m.name === name);
        return marker ? marker.time - this.trimStart : -1;
    }

    getMarkerNamesAt(localTime, tolerance = MARKER_TOLERANCE) {
        const t = this.trimStart + toFinite(localTime);
        return this._markersInTrim()
            .filter(m => Math.abs(m.time - t) <= tolerance)
            .map(m => m.name);
    }

    _markersInTrim() {
        const { trimStart, trimEnd } = this;
        return this.markers.filter(m => m.time >= trimStart && m.time <= trimEnd);
    }

    setJointWeight(jointName, weight, recursive = false) {
        const joint = this._findJointNode(jointName);
        if (!joint) return false;

        if (recursive) {
            this._setBoneWeightRecursive(joint, Number(weight));
        } else {
            this.boneWeights.set(joint.name, Number(weight));
        }
        return true;
    }

    _setBoneWeightRecursive(node, weight) {
        this.boneWeights.set(node.name, weight);
        for (const child of node.children ?? []) {
            this._setBoneWeightRecursive(child, weight);
        }
    }

    _findJointNode(name) {
        const roots = new Set();
        for (const channel of this.animation?.channels ?? []) {
            let node = channel.targetNode;
            while (node?.parent) node = node.parent;
            if (node) roots.add(node);
        }

        const visited = new Set();
        const search = (node) => {
            if (!node || visited.has(node)) return null;
            visited.add(node);
            if (node.name === name) return node;
            for (const child of node.children ?? []) {
                const found = search(child);
                if (found) return found;
            }
            return null;
        };

        for (const root of roots) {
            const found = search(root);
            if (found) return found;
        }
        return null;
    }

    _maxTime() {
        return Math.max(0, toFinite(this.animation?.duration));
    }

    destroy() {
        for (const timeline of [...this.timelines]) timeline.removeClip(this);
        this.timelines.clear();
        this.boneWeights.clear();
        this.animation = null;
        this.alive = false;
    }
}