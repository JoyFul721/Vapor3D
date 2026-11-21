// /lib/Loader/Markers.js

const DEFAULT_MARKER_FPS = 24;

/**
 * 从 glTF animation 的 extras 中读取 marker。
 * 支持以下写法（可混用）：
 *   markers: [{ name, time }] / [{ name, frame }] / [[time, name]] / [[name, time]]
 *   markers: { name: time }
 * 时间与 sampler.input 使用同一基准（秒）；frame 按 extras.fps 换算。
 * @returns {{name: string, time: number}[]} 按时间升序
 */
export function parseAnimationMarkers(animDef) {
    const extras = animDef?.extras;
    if (!extras) return [];

    const source =
        extras.markers ??
        extras.marker ??
        extras.vapor3d?.markers ??
        extras.Vapor3D?.markers;
    if (!source) return [];

    const fps = Number(
        extras.fps ?? extras.frameRate ?? extras.vapor3d?.fps ?? DEFAULT_MARKER_FPS,
    ) || DEFAULT_MARKER_FPS;

    const markers = [];

    const push = (name, time) => {
        if (name === undefined || name === null || name === "") return;
        const t = Number(time);
        if (!Number.isFinite(t)) return;
        markers.push({ name: String(name), time: t });
    };

    const pushItem = (fallbackName, item) => {
        const name = item.name ?? item.marker ?? item.label ?? fallbackName;
        const time = item.time ?? item.t;
        const frame = item.frame ?? item.f;
        if (time !== undefined) push(name, time);
        else if (frame !== undefined) push(name, Number(frame) / fps);
    };

    if (Array.isArray(source)) {
        for (const item of source) {
            if (Array.isArray(item)) {
                // [time, name] 或 [name, time]
                if (typeof item[1] === "string") push(item[1], item[0]);
                else push(item[0], item[1]);
            } else if (item && typeof item === "object") {
                pushItem(undefined, item);
            }
        }
    } else if (typeof source === "object") {
        for (const [name, value] of Object.entries(source)) {
            if (value && typeof value === "object") pushItem(name, value);
            else push(name, value);
        }
    }

    markers.sort((a, b) => a.time - b.time);
    return markers;
}
