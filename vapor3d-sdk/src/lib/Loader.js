import { GltfLoader } from 'gltf-loader-ts';
import { Node } from './Node.js';
import { Mesh } from './Mesh.js';
import { VAO } from './VAO.js';
import { Texture2D, TextureCube } from './Textures.js';
import { Math3D } from './Math3D.js';
import { Utils } from './Utils.js';
import { Skeleton } from './Skeleton.js';
import { Animation } from './Animation.js';
import { AnimationPlayer } from './AnimationPlayer.js';

export class Loader {
    constructor(gl) {
        this.gl = gl;
        this.gltfLoader = new GltfLoader();
    }

    async loadGLB(url, targetScene, modelID) {

        try {
            let loadUrl = String(url).trim();
            if (loadUrl.length > 200 && !loadUrl.startsWith('http') && !loadUrl.startsWith('data:')) {
                loadUrl = 'data:application/octet-stream;base64,' + loadUrl;
            }

            const asset = await this.gltfLoader.load(loadUrl);
            await asset.preFetchAll();

            const meshNodesList = [];
            const vaoLibrary = new Map();
            const textureCache = new Map();

            // 1 - 纹理去重加载
            if (asset.gltf.textures) {
                for (let i = 0; i < asset.gltf.textures.length; i++) {
                    const resId = `${modelID}_tex_${i}`; // 我是傻逼，我tm用原始url去拼接，直接炸缸了

                    const tex = await targetScene.getOrCreateTexture(resId, async () => {
                        const texDef = asset.gltf.textures[i];
                        if (!texDef) return null;

                        // 图片源查找
                        let imgIdx = texDef.source;
                        if (imgIdx === undefined && texDef.extensions) {
                            for (const k in texDef.extensions) {
                                if (texDef.extensions[k].source !== undefined) {
                                    imgIdx = texDef.extensions[k].source;
                                    break;
                                }
                            }
                        }
                        if (imgIdx === undefined) return null;

                        const rawImg = await asset.imageData.get(imgIdx);
                        const img = (rawImg && rawImg.image) ? rawImg.image : rawImg;
                        if (!img || img.width === 0) return null;

                        const t = new Texture2D(this.gl);
                        t.uploadImageBitmap(img); 
                        t.generateMipmap();
                        t.setFilter("LINEAR_MIPMAP_LINEAR", "LINEAR");
                        return t;
                    });
                    textureCache.set(i, tex);
                }
            }

            // 2 - 解析 Mesh
            if (asset.gltf.meshes) {
                for (let mIdx = 0; mIdx < asset.gltf.meshes.length; mIdx++) {
                    const gltfMesh = asset.gltf.meshes[mIdx];
                    const meshInstances = [];

                    for (let pIdx = 0; pIdx < gltfMesh.primitives.length; pIdx++) {
                        const prim = gltfMesh.primitives[pIdx];

                        const resId = `${modelID}_m${mIdx}_p${pIdx}`;

                        const vao = await targetScene.getOrCreateVAO(resId, async () => {
                            const v = new VAO(this.gl);

                            const posIdx = prim.attributes.POSITION; // pos
                            if (posIdx !== undefined) {
                                const raw = await asset.accessorData(posIdx);
                                v.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 0, 3);
                            }

                            const normIdx = prim.attributes.NORMAL; // normal
                            if (normIdx !== undefined) {
                                const raw = await asset.accessorData(normIdx);
                                v.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 1, 3);
                            }

                            const uvIdx = prim.attributes.TEXCOORD_0; // uv0
                            if (uvIdx !== undefined) {
                                const raw = await asset.accessorData(uvIdx);
                                v.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 2, 2);
                            }

                            const uv2Idx = prim.attributes.TEXCOORD_1; // uv1
                            if (uv2Idx !== undefined) {
                                const raw = await asset.accessorData(uv2Idx);
                                v.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 3, 2);
                            }


                            const jIdx = prim.attributes.JOINTS_0; // joint
                            if (jIdx !== undefined) {
                                const raw = await asset.accessorData(jIdx);
                                const accessor = asset.gltf.accessors[jIdx]; // 获取 accessor 的元数据
                                let jointsData;

                                // 根据 accessor.componentType 动态选择正确的 TypedArray
                                switch (accessor.componentType) {
                                    case 5121: // UNSIGNED_BYTE
                                        jointsData = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
                                        break;
                                    case 5123: // UNSIGNED_SHORT
                                        jointsData = new Uint16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
                                        break;
                                    default:
                                        console.error(`Vapor3D: Unsupported joint component type: ${accessor.componentType}`);
                                        jointsData = new Uint8Array(0); // 创建一个空数组避免后续代码崩溃
                                        break;
                                }

                                // 将整数索引转换为 Float32Array，因为顶点属性通常要求是浮点数
                                const jointsFloat = new Float32Array(jointsData);

                                // 添加到 VAO
                                v.addBuffer(jointsFloat, 4, 4);
                            }

                            const wIdx = prim.attributes.WEIGHTS_0; // weight
                            if (wIdx !== undefined) {
                                const raw = await asset.accessorData(wIdx);
                                const accessor = asset.gltf.accessors[wIdx];
                                let weightsFloat;

                                // 1. 根据数据类型正确解析
                                if (accessor.componentType === 5126) { // FLOAT
                                    weightsFloat = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice();
                                } else if (accessor.componentType === 5121) { // UNSIGNED_BYTE (Normalized)
                                    const arr = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
                                    weightsFloat = new Float32Array(arr.length);
                                    for (let i = 0; i < arr.length; i++) weightsFloat[i] = arr[i] / 255.0;
                                } else if (accessor.componentType === 5123) { // UNSIGNED_SHORT (Normalized)
                                    const arr = new Uint16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
                                    weightsFloat = new Float32Array(arr.length);
                                    for (let i = 0; i < arr.length; i++) weightsFloat[i] = arr[i] / 65535.0;
                                } else {
                                    console.error(`Vapor3D: Unsupported weights component type: ${accessor.componentType}`);
                                    weightsFloat = new Float32Array(0);
                                }

                                // 2. 你的旧代码智慧：权重归一化防爆保护
                                for (let i = 0; i < weightsFloat.length; i += 4) {
                                    let sum = weightsFloat[i] + weightsFloat[i + 1] + weightsFloat[i + 2] + weightsFloat[i + 3];
                                    if (sum > 0.0001) {
                                        weightsFloat[i] /= sum;
                                        weightsFloat[i + 1] /= sum;
                                        weightsFloat[i + 2] /= sum;
                                        weightsFloat[i + 3] /= sum;
                                    } else {
                                        // 兜底：如果都没有权重，让第一根骨头接管，防止塌陷
                                        weightsFloat[i] = 1.0;
                                        weightsFloat[i + 1] = 0.0;
                                        weightsFloat[i + 2] = 0.0;
                                        weightsFloat[i + 3] = 0.0;
                                    }
                                }

                                v.addBuffer(weightsFloat, 5, 4);
                            }

                            if (prim.indices !== undefined) { // indices
                                const raw = await asset.accessorData(prim.indices);
                                const acc = asset.gltf.accessors[prim.indices];
                                const is32 = acc.componentType === 5125;
                                const arr = is32
                                    ? new Uint32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice()
                                    : new Uint16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2).slice();
                                v.setIndices(arr, is32);
                            } else {
                                v.defaultCount = v.vbos.length > 0 ? (await asset.accessorData(posIdx)).byteLength / 12 : 0;
                            }

                            return v;
                        });

                        const meshInstance = new Mesh(gltfMesh.name || `m${mIdx}_p${pIdx}`, vao);

                        meshInstance.material.hasUV2 = (prim.attributes.TEXCOORD_1 !== undefined); // has uv2

                        const matIdx = prim.material;
                        if (matIdx !== undefined && asset.gltf.materials && asset.gltf.materials[matIdx]) {
                            const matData = asset.gltf.materials[matIdx];

                            // PBR
                            if (matData.pbrMetallicRoughness) {
                                const pbr = matData.pbrMetallicRoughness;
                                if (pbr.baseColorFactor) meshInstance.material.baseColor = pbr.baseColorFactor;

                                // Albedo
                                if (pbr.baseColorTexture) {
                                    meshInstance.material.albedoTex = textureCache.get(pbr.baseColorTexture.index);
                                }
                                // ORM
                                if (pbr.metallicRoughnessTexture) {
                                    meshInstance.material.ormTex = textureCache.get(pbr.metallicRoughnessTexture.index);
                                }
                            }

                            // Normal tex
                            if (matData.normalTexture && matData.normalTexture.index !== undefined) {
                                meshInstance.material.normalTex = textureCache.get(matData.normalTexture.index);
                            }

                            // Emissive tex
                            if (matData.emissiveTexture && matData.emissiveTexture.index !== undefined) {
                                meshInstance.material.emissiveTex = textureCache.get(matData.emissiveTexture.index);
                            }

                            // Ao tex
                            if (!meshInstance.material.ormTex && matData.occlusionTexture) {
                                meshInstance.material.ormTex = textureCache.get(matData.occlusionTexture.index);
                            }

                            if (matData.normalTexture) {
                                const nIdx = matData.normalTexture.index;
                                const cachedTex = textureCache.get(nIdx);
                                meshInstance.material.normalTex = cachedTex;
                            }
                        }


                        meshInstances.push(meshInstance);
                    }
                    vaoLibrary.set(mIdx, meshInstances);
                }
            }

            // 3 - 解析 Node
            const vNodes = asset.gltf.nodes.map((n, i) => {
                const vNode = new Node(n.name || `${modelID}_n${i}`);
                if (n.matrix) {
                    const { t, q, s } = Math3D.mat4_decompose(n.matrix);
                    vNode.position = t; vNode.quaternion = q; vNode.scale = s;
                } else {
                    vNode.position = n.translation ? [...n.translation] : [0, 0, 0];
                    vNode.quaternion = n.rotation ? [...n.rotation] : [0, 0, 0, 1];
                    vNode.scale = n.scale ? [...n.scale] : [1, 1, 1];
                }
                return vNode;
            });

            // 4 - 解析 Skin
            const skeletons = [];
            if (asset.gltf.skins) {
                for (let sDef of asset.gltf.skins) {
                    // 获取骨骼节点引用：将索引 [0, 5, 22] 变成 [vNodes[0], vNodes[5], vNodes[22]]
                    const jointNodes = sDef.joints.map(idx => vNodes[idx]);

                    // 获取 IBM
                    let ibms = null;
                    if (sDef.inverseBindMatrices !== undefined) {
                        const rawIbm = await asset.accessorData(sDef.inverseBindMatrices);
                        ibms = new Float32Array(rawIbm.buffer, rawIbm.byteOffset, rawIbm.byteLength / 4).slice();
                    }

                    // 创建 Skeleton 实例
                    const skel = new Skeleton(this.gl, `${modelID}_skel`, jointNodes, ibms);
                    skeletons.push(skel);
                    targetScene.addSkeleton(skel); // 注册到场景统一管理
                }
            }


            // 组装 Node 树
            asset.gltf.nodes.forEach((nDef, i) => {
                const vNode = vNodes[i];

                if (nDef.children) {
                    nDef.children.forEach(cIdx => vNode.addChild(vNodes[cIdx]));
                }

                if (nDef.mesh !== undefined) {
                    const meshInsts = vaoLibrary.get(nDef.mesh);
                    if (meshInsts) {
                        meshInsts.forEach((mInst, pIdx) => {
                            if (pIdx === 0) {
                                vNode.mesh = mInst;
                                meshNodesList.push(vNode);
                            } else {
                                const subNode = new Node(`${vNode.name}_p${pIdx}`);
                                subNode.mesh = mInst;
                                vNode.addChild(subNode);
                                meshNodesList.push(subNode);
                            }
                        });
                    }
                    if (nDef.skin !== undefined) {
                        // 找到对应的 Skeleton 并挂载到 Mesh 上
                        const targetSkel = skeletons[nDef.skin];
                        // 没考虑多个 prim
                        const meshInstances = vaoLibrary.get(nDef.mesh);
                        meshInstances.forEach(mInst => {
                            mInst.skeleton = targetSkel; // 关联骨架
                            mInst.isSkinned = true;
                        });
                    }
                }
            });

            // 5 - Animation
            const animations = new Map();
            if (asset.gltf.animations) {
                for (const animDef of asset.gltf.animations) {
                    const samplers = [];
                    // 1. Pre-fetch and parse all samplers for this animation
                    for (const samplerDef of animDef.samplers) {
                        const inputData = await asset.accessorData(samplerDef.input);
                        const outputData = await asset.accessorData(samplerDef.output);
                        samplers.push({
                            input: new Float32Array(inputData.buffer, inputData.byteOffset, inputData.byteLength / 4).slice(),
                            output: new Float32Array(outputData.buffer, outputData.byteOffset, outputData.byteLength / 4).slice(),
                            interpolation: samplerDef.interpolation || 'LINEAR',
                        });
                    }

                    // 2. Parse channels which link samplers to nodes
                    const channels = animDef.channels.map(channelDef => {
                        return {
                            sampler: channelDef.sampler,
                            targetNode: vNodes[channelDef.target.node], // Link to the actual Node instance
                            path: channelDef.target.path, // 'translation', 'rotation', or 'scale'
                        };
                    });

                    const animName = animDef.name || `anim_${animations.size}`;
                    animations.set(animName, new Animation(animName, channels, samplers));
                }
            }

            // 6 - 组装根节点
            const modelRoot = new Node(modelID);
            const defaultScene = asset.gltf.scenes[asset.gltf.scene || 0];
            if (defaultScene && defaultScene.nodes) {
                defaultScene.nodes.forEach(idx => modelRoot.addChild(vNodes[idx]));
            }
            if (skeletons.length > 0) {
                modelRoot.skeleton = skeletons[0];
            }
            if (animations.size > 0) {
                modelRoot.animations = animations;
                modelRoot.animationPlayer = new AnimationPlayer(animations);
            }

            return { root: modelRoot, meshNodes: meshNodesList };

        } catch (error) {
            console.error(`\n[Vapor3D: Failed to load GLB : "${modelID}"`);
            console.error(`Source: ${String(url).substring(0, 50)}...`);
            console.error(error);
            return null;
        }
    }





    // 加载 Texture2D
    async loadTexture(url) {
        const data = await Utils.fetchBinary(url);
        const blob = new Blob([data]);
        const bitmap = await createImageBitmap(blob);
        const tex = new Texture2D(this.gl);
        tex.uploadImageBitmap(bitmap);
        return tex;
    }

    // 从 ImageBitmap/Canvas/Blob 加载
    async loadTextureFromSource(source) {
        const bitmap = await createImageBitmap(source);
        const tex = new Texture2D(this.gl);
        tex.uploadImageBitmap(bitmap);
        return tex;
    }

    // 加载 KTX 1.0
    async loadTextureKTX(url) {
        const data = await Utils.fetchBinary(url);
        const ktxData = Utils.parseKTX(data.buffer);
        const tex = new TextureCube(this.gl);
        tex.uploadKTX(ktxData);
        return tex;
    }
}