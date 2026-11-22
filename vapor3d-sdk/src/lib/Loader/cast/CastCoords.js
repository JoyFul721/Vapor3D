// /lib/Loader/CastCoords.js

/**
 * Z-up / X-forward -> glTF（Y-up / -Z-forward）
 * 三角形绕序无需翻转
 */

export function toVaporVec3(v) {
    return [-v[1], v[2], -v[0]];
}

export function toVaporQuat(q) {
    return [-q[1], q[2], -q[0], q[3]];
}

export function toVaporScale(s) {
    return [s[1], s[2], s[0]];
}
