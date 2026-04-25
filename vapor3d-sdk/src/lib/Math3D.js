export class Math3D {
    static identity() { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }
    static perspective(fovy, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fovy);
        const rangeInv = 1.0 / (near - far);
        return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (near + far) * rangeInv, -1, 0, 0, near * far * rangeInv * 2, 0];
    }
    static lookAt(eye, target, up) {
        const [ex, ey, ez] = eye, [tx, ty, tz] = target, [ux, uy, uz] = up;
        let zx = ex - tx, zy = ey - ty, zz = ez - tz;
        let len = Math.sqrt(zx * zx + zy * zy + zz * zz);
        if (len > 0) { len = 1 / len; zx *= len; zy *= len; zz *= len; }
        let xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx;
        len = Math.sqrt(xx * xx + xy * xy + xz * xz);
        if (len > 0) { len = 1 / len; xx *= len; xy *= len; xz *= len; }
        let yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
        return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * ex + xy * ey + xz * ez), -(yx * ex + yy * ey + yz * ez), -(zx * ex + zy * ey + zz * ez), 1];
    }
    static translate(m, tx, ty, tz) {
        return [m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11],
        (tx || 0) * m[0] + (ty || 0) * m[4] + (tz || 0) * m[8] + m[12],
        (tx || 0) * m[1] + (ty || 0) * m[5] + (tz || 0) * m[9] + m[13],
        (tx || 0) * m[2] + (ty || 0) * m[6] + (tz || 0) * m[10] + m[14],
        (tx || 0) * m[3] + (ty || 0) * m[7] + (tz || 0) * m[11] + m[15]];
    }
    static scale(m, sx, sy, sz) {
        return [(sx || 1) * m[0], (sx || 1) * m[1], (sx || 1) * m[2], (sx || 1) * m[3],
        (sy || 1) * m[4], (sy || 1) * m[5], (sy || 1) * m[6], (sy || 1) * m[7],
        (sz || 1) * m[8], (sz || 1) * m[9], (sz || 1) * m[10], (sz || 1) * m[11], m[12], m[13], m[14], m[15]];
    }
    static rotateX(m, rad) {
        const c = Math.cos(rad), s = Math.sin(rad);
        return [m[0], m[1], m[2], m[3], c * m[4] + s * m[8], c * m[5] + s * m[9], c * m[6] + s * m[10], c * m[7] + s * m[11], c * m[8] - s * m[4], c * m[9] - s * m[5], c * m[10] - s * m[6], c * m[11] - s * m[7], m[12], m[13], m[14], m[15]];
    }
    static rotateY(m, rad) {
        const c = Math.cos(rad), s = Math.sin(rad);
        return [c * m[0] - s * m[8], c * m[1] - s * m[9], c * m[2] - s * m[10], c * m[3] - s * m[11], m[4], m[5], m[6], m[7], s * m[0] + c * m[8], s * m[1] + c * m[9], s * m[2] + c * m[10], s * m[3] + c * m[11], m[12], m[13], m[14], m[15]];
    }
    static rotateZ(m, rad) {
        const c = Math.cos(rad), s = Math.sin(rad);
        return [c * m[0] + s * m[4], c * m[1] + s * m[5], c * m[2] + s * m[6], c * m[3] + s * m[7], c * m[4] - s * m[0], c * m[5] - s * m[1], c * m[6] - s * m[2], c * m[7] - s * m[3], m[8], m[9], m[10], m[11], m[12], m[13], m[14], m[15]];
    }
    static multiply(a, b) {
        const out = new Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out[i * 4 + j] = a[i * 4 + 0] * b[0 * 4 + j] + a[i * 4 + 1] * b[1 * 4 + j] + a[i * 4 + 2] * b[2 * 4 + j] + a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        return out;
    }
    static inverse(m) {
        const [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15] = m;
        const b00 = m0 * m5 - m1 * m4, b01 = m0 * m6 - m2 * m4, b02 = m0 * m7 - m3 * m4;
        const b03 = m1 * m6 - m2 * m5, b04 = m1 * m7 - m3 * m5, b05 = m2 * m7 - m3 * m6;
        const b06 = m8 * m13 - m9 * m12, b07 = m8 * m14 - m10 * m12, b08 = m8 * m15 - m11 * m12;
        const b09 = m9 * m14 - m10 * m13, b10 = m9 * m15 - m11 * m13, b11 = m10 * m15 - m11 * m14;
        const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        const invDet = 1.0 / det;
        return [
            (m5 * b11 - m6 * b10 + m7 * b09) * invDet, (m2 * b10 - m1 * b11 - m3 * b09) * invDet,
            (m13 * b05 - m14 * b04 + m15 * b03) * invDet, (m10 * b04 - m9 * b05 - m11 * b03) * invDet,
            (m6 * b08 - m4 * b11 - m7 * b07) * invDet, (m0 * b11 - m2 * b08 + m3 * b07) * invDet,
            (m14 * b02 - m12 * b05 - m15 * b01) * invDet, (m8 * b05 - m10 * b02 + m11 * b01) * invDet,
            (m4 * b10 - m5 * b08 + m7 * b06) * invDet, (m1 * b08 - m0 * b10 - m3 * b06) * invDet,
            (m12 * b04 - m13 * b02 + m15 * b00) * invDet, (m9 * b02 - m8 * b04 - m11 * b00) * invDet,
            (m5 * b07 - m4 * b09 - m6 * b06) * invDet, (m0 * b09 - m1 * b07 + m2 * b06) * invDet,
            (m13 * b01 - m12 * b03 - m14 * b00) * invDet, (m8 * b03 - m9 * b01 + m10 * b00) * invDet
        ];
    }
    static v3_add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
    static v3_sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    static v3_mul(a, b) { return [a[0] * b[0], a[1] * b[1], a[2] * b[2]]; }
    static v3_normalize(v) {
        const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return l > 0 ? [v[0] / l, v[1] / l, v[2] / l] : [0, 0, 0];
    }
    static v3_transform(v, m) {
        return [
            v[0] * m[0] + v[1] * m[4] + v[2] * m[8] + m[12],
            v[0] * m[1] + v[1] * m[5] + v[2] * m[9] + m[13],
            v[0] * m[2] + v[1] * m[6] + v[2] * m[10] + m[14]
        ];
    }
}