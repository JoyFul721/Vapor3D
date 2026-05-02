//  GL 列主序
// 这有一个坑，Float32Array 是对象而不是数组
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export class Math3D {
    // ==========================================
    //                  vec3
    // ==========================================
    static vec3_create(x = 0, y = 0, z = 0) { return [x, y, z]; }
    static vec3_add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
    static vec3_sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    static vec3_mul(a, b) { return [a[0] * b[0], a[1] * b[1], a[2] * b[2]]; }
    static vec3_normalize(v) {
        const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return l > 0 ? [v[0] / l, v[1] / l, v[2] / l] : [0, 0, 0];
    }
    static vec3_transform(v, m) {
        return [
            v[0] * m[0] + v[1] * m[4] + v[2] * m[8] + m[12],
            v[0] * m[1] + v[1] * m[5] + v[2] * m[9] + m[13],
            v[0] * m[2] + v[1] * m[6] + v[2] * m[10] + m[14]
        ];
    }
    static vec3_lerp(a, b, t) {
        return [
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t
        ];
    }

    // ==========================================
    //                 mat4
    // ==========================================
    static mat4_identity() { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }

    static mat4_perspective(fovy, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fovy);
        const rangeInv = 1.0 / (near - far);
        return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (near + far) * rangeInv, -1, 0, 0, near * far * rangeInv * 2, 0];
    }

    static mat4_translate(m, tx, ty, tz) {
        const out = [...m]; 
        out[12] = m[0] * tx + m[4] * ty + m[8] * tz + m[12];
        out[13] = m[1] * tx + m[5] * ty + m[9] * tz + m[13];
        out[14] = m[2] * tx + m[6] * ty + m[10] * tz + m[14];
        out[15] = m[3] * tx + m[7] * ty + m[11] * tz + m[15];
        return out;
    }
    static mat4_scale(m, sx, sy, sz) {
        return [(sx || 1) * m[0], (sx || 1) * m[1], (sx || 1) * m[2], (sx || 1) * m[3],
        (sy || 1) * m[4], (sy || 1) * m[5], (sy || 1) * m[6], (sy || 1) * m[7],
        (sz || 1) * m[8], (sz || 1) * m[9], (sz || 1) * m[10], (sz || 1) * m[11], m[12], m[13], m[14], m[15]];
    }
    static mat4_rotateX(m, rad) {
        const c = Math.cos(rad), s = Math.sin(rad);
        const out = [...m];
        const m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7];
        const m8 = m[8], m9 = m[9], m10 = m[10], m11 = m[11];

        out[4] = m4 * c + m8 * s;
        out[5] = m5 * c + m9 * s;
        out[6] = m6 * c + m10 * s;
        out[7] = m7 * c + m11 * s;
        out[8] = m8 * c - m4 * s;
        out[9] = m9 * c - m5 * s;
        out[10] = m10 * c - m6 * s;
        out[11] = m11 * c - m7 * s;
        return out;
    }
    static mat4_rotateY(m, rad) {
        const c = Math.cos(rad), s = Math.sin(rad);
        return [c * m[0] - s * m[8], c * m[1] - s * m[9], c * m[2] - s * m[10], c * m[3] - s * m[11], m[4], m[5], m[6], m[7], s * m[0] + c * m[8], s * m[1] + c * m[9], s * m[2] + c * m[10], s * m[3] + c * m[11], m[12], m[13], m[14], m[15]];
    }
    static mat4_rotateZ(m, rad) {
        const c = Math.cos(rad), s = Math.sin(rad);
        return [c * m[0] + s * m[4], c * m[1] + s * m[5], c * m[2] + s * m[6], c * m[3] + s * m[7], c * m[4] - s * m[0], c * m[5] - s * m[1], c * m[6] - s * m[2], c * m[7] - s * m[3], m[8], m[9], m[10], m[11], m[12], m[13], m[14], m[15]];
    }

    static mat4_lookAt(eye, target, up) {
        const [ex, ey, ez] = eye, [tx, ty, tz] = target, [ux, uy, uz] = up;
        let zx = ex - tx, zy = ey - ty, zz = ez - tz;
        let len = 1 / (Math.sqrt(zx * zx + zy * zy + zz * zz) || 1);
        zx *= len; zy *= len; zz *= len;
        let xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx;
        len = 1 / (Math.sqrt(xx * xx + xy * xy + xz * xz) || 1);
        xx *= len; xy *= len; xz *= len;
        let yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
        return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * ex + xy * ey + xz * ez), -(yx * ex + yy * ey + yz * ez), -(zx * ex + zy * ey + zz * ez), 1];
    }

    static mat4_fromRTS(q, t, s) {
        const [x, y, z, w] = q, [sx, sy, sz] = s, [tx, ty, tz] = t;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;
        return [
            (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
            (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
            (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
            tx, ty, tz, 1
        ];
    }

    static mat4_decompose(m) {
        const sx = Math.hypot(m[0], m[1], m[2]);
        const sy = Math.hypot(m[4], m[5], m[6]);
        const sz = Math.hypot(m[8], m[9], m[10]);
        const r = [m[0] / sx, m[1] / sx, m[2] / sx, m[4] / sy, m[5] / sy, m[6] / sy, m[8] / sz, m[9] / sz, m[10] / sz];
        const trace = r[0] + r[4] + r[8];
        let q = [0, 0, 0, 1];
        if (trace > 0) {
            const s = Math.sqrt(trace + 1.0) * 2;
            q = [(r[5] - r[7]) / s, (r[6] - r[2]) / s, (r[1] - r[3]) / s, 0.25 * s];
        } else if (r[0] > r[4] && r[0] > r[8]) {
            const s = Math.sqrt(1.0 + r[0] - r[4] - r[8]) * 2;
            q = [0.25 * s, (r[1] + r[3]) / s, (r[6] + r[2]) / s, (r[5] - r[7]) / s];
        } else if (r[4] > r[8]) {
            const s = Math.sqrt(1.0 + r[4] - r[0] - r[8]) * 2;
            q = [(r[1] + r[3]) / s, 0.25 * s, (r[5] + r[7]) / s, (r[6] - r[2]) / s];
        } else {
            const s = Math.sqrt(1.0 + r[8] - r[0] - r[4]) * 2;
            q = [(r[6] + r[2]) / s, (r[5] + r[7]) / s, 0.25 * s, (r[1] - r[3]) / s];
        }
        return { t: [m[12], m[13], m[14]], q, s: [sx, sy, sz] };
    }

    static mat4_multiply(a, b) {
        const out = new Array(16);

        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        return out;
    }

    static mat4_inverse(m) {
        const [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15] = m;
        const b00 = m0 * m5 - m1 * m4, b01 = m0 * m6 - m2 * m4, b02 = m0 * m7 - m3 * m4;
        const b03 = m1 * m6 - m2 * m5, b04 = m1 * m7 - m3 * m5, b05 = m2 * m7 - m3 * m6;
        const b06 = m8 * m13 - m9 * m12, b07 = m8 * m14 - m10 * m12, b08 = m8 * m15 - m11 * m12;
        const b09 = m9 * m14 - m10 * m13, b10 = m9 * m15 - m11 * m13, b11 = m10 * m15 - m11 * m14;
        const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return this.mat4_identity();
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

    // ==========================================
    //                 vec3
    // ==========================================

    static v3_add(a, b) { return this.vec3_add(a, b); }
    static v3_sub(a, b) { return this.vec3_sub(a, b); }
    static v3_mul(a, b) { return this.vec3_mul(a, b); }
    static v3_normalize(v) { return this.vec3_normalize(v); }
    static v3_transform(v, m) { return this.vec3_transform(v, m); }


    // ==========================================
    //                 TRS
    // ==========================================
    static TRS_create(px, py, pz, rx, ry, rz, sx, sy, sz) {
        return JSON.stringify([
            Number(px), Number(py), Number(pz),
            Number(rx), Number(ry), Number(rz),
            Number(sx), Number(sy), Number(sz)
        ]);
    }

    static TRS_decompose(trsString, type, axis) {
            const d = JSON.parse(trsString);
            if (!Array.isArray(d)) return 0;

            const typeMap = { "Pos": 0, "Rot": 3, "Scale": 6 };
            const axisMap = { "X": 0, "Y": 1, "Z": 2 };

            const index = (typeMap[type] ?? 0) + (axisMap[axis] ?? 0);
            return d[index] ?? 0;
    }

    static TRS_add(trsA, trsB) {
        const a = this.TRS_parse(trsA);
        const b = this.TRS_parse(trsB);
        if (!a || !b) return trsA;

        const newPos = this.vec3_add(a.position, b.position);

        const qA = this.quat_fromEuler(...a.euler);
        const qB = this.quat_fromEuler(...b.euler);
        const newQuat = this.quat_multiply(qB, qA);
        const newEuler = this.quat_toEuler(newQuat);

        const newScale = [
            a.scale[0] * b.scale[0],
            a.scale[1] * b.scale[1],
            a.scale[2] * b.scale[2]
        ];

        return this.TRS_create(
            newPos[0], newPos[1], newPos[2],
            newEuler[0], newEuler[1], newEuler[2],
            newScale[0], newScale[1], newScale[2]
        );
    }

    static TRS_lerp(trsStart, trsEnd, t) {
        const s = this.TRS_parse(trsStart);
        const e = this.TRS_parse(trsEnd);
        if (!s || !e) return trsStart;

        const p = [
            s.position[0] + (e.position[0] - s.position[0]) * t,
            s.position[1] + (e.position[1] - s.position[1]) * t,
            s.position[2] + (e.position[2] - s.position[2]) * t
        ];

        const qS = this.quat_fromEuler(...s.euler);
        const qE = this.quat_fromEuler(...e.euler);
        const qResult = this.quat_slerp(qS, qE, t);
        const r = this.quat_toEuler(qResult);

        const sc = [
            s.scale[0] + (e.scale[0] - s.scale[0]) * t,
            s.scale[1] + (e.scale[1] - s.scale[1]) * t,
            s.scale[2] + (e.scale[2] - s.scale[2]) * t
        ];

        return this.TRS_create(p[0], p[1], p[2], r[0], r[1], r[2], sc[0], sc[1], sc[2]);
    }

    static TRS_parse(trsString) {
        try {
            const d = JSON.parse(trsString);
            if (!Array.isArray(d) || d.length < 9) return null;

            return {
                position: [d[0], d[1], d[2]],
                euler: [d[3], d[4], d[5]],
                scale: [d[6], d[7], d[8]]
            };
        } catch (e) {
            return null;
        }
    }


    // ==========================================
    //                 Quat
    // ==========================================
    static quat_identity() { return [0, 0, 0, 1]; }

    // 欧拉角 -> 四元数
    static quat_fromEuler(x, y, z) {
        const ax = x * DEG2RAD * 0.5, ay = y * DEG2RAD * 0.5, az = z * DEG2RAD * 0.5;
        const sx = Math.sin(ax), cx = Math.cos(ax);
        const sy = Math.sin(ay), cy = Math.cos(ay);
        const sz = Math.sin(az), cz = Math.cos(az);
        return [
            sx * cy * cz + cx * sy * sz,
            cx * sy * cz - sx * cy * sz,
            cx * cy * sz - sx * sy * cz,
            cx * cy * cz + sx * sy * sz
        ];
    }

    // 四元数 -> 欧拉角
    static quat_toEuler(q) {
        const [x, y, z, w] = q;
        const sinp = 2 * (w * x - y * z);
        let ex, ey, ez;
        if (Math.abs(sinp) >= 1) ex = (Math.PI / 2) * Math.sign(sinp);
        else ex = Math.asin(sinp);
        ey = Math.atan2(2 * (w * y + z * x), 1 - 2 * (x * x + y * y));
        ez = Math.atan2(2 * (w * z + x * y), 1 - 2 * (x * x + z * z));
        return [ex * RAD2DEG, ey * RAD2DEG, ez * RAD2DEG];
    }

    static quat_multiply(a, b) {
        const [ax, ay, az, aw] = a, [bx, by, bz, bw] = b;
        return [
            ax * bw + aw * bx + ay * bz - az * by,
            ay * bw + aw * by + az * bx - ax * bz,
            az * bw + aw * bz + ax * by - ay * bx,
            aw * bw - ax * bx - ay * by - az * bz
        ];
    }

    static quat_slerp(a, b, t) {
        let ax = a[0], ay = a[1], az = a[2], aw = a[3];
        let bx = b[0], by = b[1], bz = b[2], bw = b[3];

        let cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw;

        // 如果点积为负，反转一个四元数以取短路径
        if (cosHalfTheta < 0) {
            bx = -bx; by = -by; bz = -bz; bw = -bw;
            cosHalfTheta = -cosHalfTheta;
        }

        if (Math.abs(cosHalfTheta) >= 1.0) return [ax, ay, az, aw];

        const halfTheta = Math.acos(cosHalfTheta);
        const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

        if (Math.abs(sinHalfTheta) < 0.001) {
            return [
                ax * 0.5 + bx * 0.5,
                ay * 0.5 + by * 0.5,
                az * 0.5 + bz * 0.5,
                aw * 0.5 + bw * 0.5
            ];
        }

        const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
        const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

        return [
            ax * ratioA + bx * ratioB,
            ay * ratioA + by * ratioB,
            az * ratioA + bz * ratioB,
            aw * ratioA + bw * ratioB
        ];
    }
}