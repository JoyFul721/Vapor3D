// /lib/Loader/cast/CastLoader.js

import {
    Primitive, Material, Mesh,
    VAO,
    Math3D, Utils, Skeleton,
    TransformNode, MeshNode,
} from '../../index.js';
import { LoaderBase } from '../LoaderBase.js';
import { parseCast, CastWorkspace } from './CastParser.js';
import { toVaporVec3, toVaporQuat, toVaporScale } from './CastCoords.js';
import { buildCastAnimations } from './CastAnimation.js';

function asArray(value) {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
}

function vecList(value, stride) {
    const list = asArray(value);
    if (list.length === 0) return [];
    return typeof list[0] === "number" && list.length === stride ? [list] : list;
}

function indexList(value) {
    const out = [];
    for (const item of asArray(value)) {
        if (Array.isArray(item)) out.push(...item);
        else out.push(item);
    }
    return out;
}

function toNumberArray(value) {
    if (value === undefined || value === null) return null;
    const out = asArray(value).map(Number);
    return out.every(Number.isFinite) ? out : null;
}


export class CastLoader extends LoaderBase {
    constructor(gl, registry) {
        super(gl, registry);
    }

    async _fetchWorkspace(url) {
        const raw = await Utils.fetchBinary(url);
        const buffer = raw instanceof ArrayBuffer
            ? raw
            : raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
        return new CastWorkspace(parseCast(buffer, String(url)));
    }

    _bindingsOf(skeleton) {
        const joints = skeleton?.joints ?? [];
        const boneByName = new Map();
        for (let i = 0; i < joints.length; i++) {
            boneByName.set(String(joints[i].name).toLowerCase(), i);
        }
        return { joints, boneByName };
    }

     // 多骨架时挑骨骼名匹配最多的   
    _pickSkin(envelopes, animNodes) {
        if (envelopes.length <= 1) return envelopes[0] ?? null;

        const names = new Set();
        for (const animNode of animNodes) {
            for (const curve of animNode.children) {
                if (curve.type !== "curv") continue;
                const name = String(curve.properties.nn ?? "").toLowerCase();
                if (name) names.add(name);
            }
        }
        if (names.size === 0) return envelopes[0];

        let best = envelopes[0];
        let bestScore = -1;
        for (const envelope of envelopes) {
            let score = 0;
            for (const name of names) {
                if (envelope.boneByName.has(name)) score++;
            }
            if (score > bestScore) {
                bestScore = score;
                best = envelope;
            }
        }
        return best;
    }

    /**
     * 注册动画并按名称放进 Container，返回 Registry Index 列表
     */
    _registerAnimations(container, animations, sourceName) {
        const indices = [];
        for (const animation of animations) {
            indices.push(this.reg("animations", animation));

            let key = animation.name || `${sourceName}_anim${indices.length - 1}`;
            let suffix = 1;
            while (container.animations.has(key)) key = `${animation.name}_${suffix++}`;
            container.animations.set(key, animation);
        }
        return indices;
    }

    /**
     * 纯动画文件：不封装 Container，动画直接注册到 Registry
     * @returns {number[]} 动画的 Registry Index 列表
     */
    _loadAnimationsOnly(animNodes, modelID) {
        const names = new Set();
        for (const animNode of animNodes) {
            for (const curve of animNode.children) {
                if (curve.type !== "curv") continue;
                const name = String(curve.properties.nn ?? "");
                if (name) names.add(name);
            }
        }

        const joints = [];
        const boneByName = new Map();
        for (const name of names) {
            boneByName.set(name.toLowerCase(), joints.length);
            joints.push({ name, position: [0, 0, 0] });
        }

        const animations = buildCastAnimations(animNodes, joints, boneByName, modelID);

        const indices = [];
        for (const animation of animations) {
            indices.push(this.reg("animations", animation));
        }
        return indices;
    }

    /**
     * 统一入口
     *  - 文件含 modl -> 构建并返回 Container
     *  - 只有 anim   -> 动画独立注册，返回动画索引列表
     * @returns {{container: AssetContainer|null, animations: number[]}|null}
     */
    async loadCast(url, modelID) {
        this.beginLoad();
        try {
            const workspace = await this._fetchWorkspace(url);
            const animNodes = workspace.ofType("anim");
            const modelNode = workspace.find("modl");

            if (!modelNode) {
                if (animNodes.length === 0) {
                    console.warn(`Vapor3D [CAST]: "${url}" has neither "modl" nor "anim" node.`);
                    return null;
                }
                const animations = this._loadAnimationsOnly(animNodes, modelID);
                console.log(`Vapor3D [CAST]: "${modelID}" animation-only cast, ${animations.length} animation(s).`);
                return { container: null, animations };
            }

            const sourceID = `MODEL_${modelID}`;

            const white = this.getValueTexture("cast_white", 255, 255, 255);
            const orm = this.getValueTexture("cast_orm", 255, 255, 0);
            const normal = this.getValueTexture("cast_normal", 128, 128, 255);
            const emissive = this.getValueTexture("cast_emissive", 0, 0, 0);

            /*
            Material
            材质保留占位贴图，并把各槽位的资源 URL 暴露给积木。
            */
            const materialsByHash = new Map();
            for (const matNode of workspace.ofType("matl")) {
                const props = matNode.properties;
                const mat = new Material();
                mat.name = String(props.nn ?? props.n ?? `mat_${matNode.hash.toString().slice(-6)}`);
                mat.baseColor = [1, 1, 1, 1];
                mat.alpha = 1;
                mat.roughness = 1;
                mat.metallic = 0;

                mat.albedoTex = white;
                mat.ormTex = orm;
                mat.normalTex = normal;
                mat.emissiveTex = emissive;

                mat.textureURLs = {
                    albedo: workspace.rawPath(props.albedo ?? props.cs) ?? "",
                    normal: workspace.rawPath(props.normal ?? props.ng) ?? "",
                    orm: workspace.rawPath(props.specular ?? props.sm) ?? "",
                    emissive: workspace.rawPath(props.emissive ?? props.em) ?? "",
                };

                this.reg("materials", mat);
                materialsByHash.set(matNode.hash.toString(), mat);
            }

            const getDefaultMaterial = () => this.getDefaultMaterial(`${sourceID}:MAT:default`);

            /*
            Skeleton
            */
            const skelNodes = modelNode.children.filter(c => c.type === "skel");
            const skeletons = [];

            for (const [skelIndex, skelNode] of skelNodes.entries()) {
                const boneNodes = skelNode.children.filter(c => c.type === "bone");
                const boneCount = boneNodes.length;
                if (boneCount === 0) continue;

                const boneParents = new Array(boneCount).fill(-1);
                const joints = [];
                const boneByName = new Map();

                for (let i = 0; i < boneCount; i++) {
                    const props = boneNodes[i].properties;

                    const node = new TransformNode(String(props.n ?? `bone_${i}`));
                    node.position = toVaporVec3(toNumberArray(props.lp) ?? [0, 0, 0]);
                    node.quaternion = toVaporQuat(toNumberArray(props.lr) ?? [0, 0, 0, 1]);
                    node.scale = toVaporScale(toNumberArray(props.s) ?? [1, 1, 1]);

                    this.reg("nodes", node);
                    joints.push(node);
                    boneByName.set(node.name.toLowerCase(), i);

                    const parent = Number(props.p);
                    boneParents[i] = Number.isInteger(parent) && parent >= 0 && parent < boneCount
                        ? parent
                        : -1;
                }

                const worldRest = new Array(boneCount).fill(null);
                const computeWorldRest = (index, depth = 0) => {
                    if (index < 0 || index >= boneCount) return Math3D.mat4_identity;
                    if (worldRest[index]) return worldRest[index];
                    if (depth > boneCount) return Math3D.mat4_identity;

                    const joint = joints[index];
                    const local = Math3D.mat4_fromRTS(joint.quaternion, joint.position, joint.scale);
                    const parent = boneParents[index];
                    const world = parent >= 0
                        ? Math3D.mat4_multiply(computeWorldRest(parent, depth + 1), local)
                        : local;

                    worldRest[index] = world;
                    return world;
                };

                const ibms = new Float32Array(boneCount * 16);
                for (let i = 0; i < boneCount; i++) {
                    ibms.set(Math3D.mat4_inverse(computeWorldRest(i)), i * 16);
                }

                const skeletonName = boneCount > 1 || skeletons.length === 0
                    ? `${modelID}_skel${skelIndex}`
                    : `${modelID}_skel`;
                const skeleton = new Skeleton(this.gl, skeletonName, joints, ibms);
                // IBM 由骨骼链本地矩阵生成
                skeleton.bindSpaceIncludesAncestors = false;
                this.reg("skeletons", skeleton);
                skeletons.push({ skeleton, joints, boneByName, boneCount, boneParents });
            }

            for (const entry of skeletons) {
                for (let i = 0; i < entry.boneCount; i++) {
                    const parent = entry.boneParents[i];
                    if (parent >= 0) entry.joints[parent].addChild(entry.joints[i]);
                }
            }

            /*
            Mesh
            */
            const meshNodesList = [];
            const meshNodes = modelNode.children.filter(c => c.type === "mesh");

            meshNodes.forEach((def, index) => {
                const props = def.properties;

                const positions = vecList(props.vp, 3);
                if (positions.length === 0) {
                    console.warn(`Vapor3D [CAST]: mesh "${props.n}" has no vertex positions, skipped.`);
                    return;
                }

                const vao = new VAO(this.gl);
                this.reg("vaos", vao);

                const posData = new Float32Array(positions.length * 3);
                for (let i = 0; i < positions.length; i++) {
                    const p = toVaporVec3(positions[i]);
                    posData[i * 3] = p[0];
                    posData[i * 3 + 1] = p[1];
                    posData[i * 3 + 2] = p[2];
                }
                vao.addBuffer(posData, 0, 3);

                const normals = vecList(props.vn, 3);
                if (normals.length > 0) {
                    const normData = new Float32Array(normals.length * 3);
                    for (let i = 0; i < normals.length; i++) {
                        const n = toVaporVec3(normals[i]);
                        normData[i * 3] = n[0];
                        normData[i * 3 + 1] = n[1];
                        normData[i * 3 + 2] = n[2];
                    }
                    vao.addBuffer(normData, 1, 3);
                }

                const uvs = vecList(props.u0 ?? props.u1, 2);
                if (uvs.length > 0) {
                    const uvData = new Float32Array(uvs.length * 2);
                    for (let i = 0; i < uvs.length; i++) {
                        uvData[i * 2] = Number(uvs[i][0]);
                        uvData[i * 2 + 1] = Number(uvs[i][1]);
                    }
                    vao.addBuffer(uvData, 2, 2);
                }

                // skin：wb 骨骼索引，wv 权重，mi 每顶点影响数
                const jointIdx = indexList(props.wb);
                const weights = indexList(props.wv);
                const influences = Math.max(1, Number(props.mi) || 1);

                // 多骨架时按骨骼索引范围挑选能覆盖该网格的骨架
                let skin = null;
                if (jointIdx.length > 0 && weights.length > 0 && skeletons.length > 0) {
                    let maxJoint = 0;
                    for (const value of jointIdx) {
                        const n = Number(value);
                        if (Number.isFinite(n) && n > maxJoint) maxJoint = n;
                    }
                    skin = skeletons.find(s => s.boneCount > maxJoint) ?? skeletons[0];
                }

                if (skin) {
                    const count = positions.length;
                    const idxData = new Float32Array(count * 4);
                    const wgtData = new Float32Array(count * 4);

                    for (let v = 0; v < count; v++) {
                        let sum = 0;
                        for (let k = 0; k < 4; k++) {
                            const src = v * influences + k;
                            if (k < influences && src < jointIdx.length) {
                                idxData[v * 4 + k] = Number(jointIdx[src]);
                                wgtData[v * 4 + k] = Number(weights[src]);
                                sum += Number(weights[src]);
                            }
                        }
                        if (sum > 1e-6) {
                            for (let k = 0; k < 4; k++) wgtData[v * 4 + k] /= sum;
                        } else {
                            wgtData[v * 4] = 1;
                        }
                    }

                    vao.addBuffer(idxData, 4, 4);
                    vao.addBuffer(wgtData, 5, 4);
                }

                const faces = indexList(props.f);
                if (faces.length > 0) {
                    const use32 = positions.length > 65535;
                    const indexData = use32
                        ? new Uint32Array(faces.map(Number))
                        : new Uint16Array(faces.map(Number));
                    vao.setIndices(indexData, use32 ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT);
                }

                const material = props.m !== undefined
                    ? (materialsByHash.get(props.m.toString()) ?? getDefaultMaterial())
                    : getDefaultMaterial();

                const primitive = new Primitive(vao, material);
                this.reg("primitives", primitive);

                const mesh = new Mesh(String(props.n ?? `${modelID}_mesh${index}`));
                mesh.primitives.push(primitive);
                this.reg("meshes", mesh);

                const meshNode = new MeshNode(mesh.name, mesh);
                this.reg("nodes", meshNode);

                if (skin) {
                    meshNode.skeleton = skin.skeleton;
                    meshNode.isSkinned = true;
                }

                meshNodesList.push(meshNode);
            });

            /*
            Assemble AssetContainer
            */
            const modelRoot = new TransformNode(modelID);

            for (const entry of skeletons) {
                for (let i = 0; i < entry.boneCount; i++) {
                    if (entry.boneParents[i] === -1) modelRoot.addChild(entry.joints[i]);
                }
            }
            for (const meshNode of meshNodesList) modelRoot.addChild(meshNode);

            const container = this.buildContainer({
                name: modelID,
                rootNode: modelRoot,
                meshes: meshNodesList,
                skeletons: skeletons.map(s => s.skeleton),
            });

            // 同文件内的动画（若存在）
            let animationIndices = [];
            if (animNodes.length > 0) {
                const skin = this._pickSkin(skeletons.map(s => ({
                    joints: s.joints, boneByName: s.boneByName,
                })), animNodes);
                const animations = buildCastAnimations(animNodes, skin.joints, skin.boneByName, modelID);
                animationIndices = this._registerAnimations(container, animations, modelID);
            }

            console.log(
                `Vapor3D [CAST]: "${modelID}" skeletons=${skeletons.length} meshes=${meshNodesList.length} ` +
                `materials=${materialsByHash.size} animations=${animationIndices.length}`,
            );

            return { container, animations: animationIndices };
        } catch (error) {
            console.error(`Vapor3D [CAST]: Failed to load "${url}"`);
            console.error(error);
            return null;
        }
    }
}