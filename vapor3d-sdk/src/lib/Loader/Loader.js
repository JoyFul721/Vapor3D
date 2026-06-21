import { GltfLoader } from 'gltf-loader-ts';

import { Mesh, VAO, Texture2D, TextureCube, Math3D, Utils, Skeleton, Animation, TransformNode, MeshNode, AssetContainer } from '../index.js';

// 全局物理缓冲区映射
// 使用 WeakMap 确保 ArrayBuffer 被释放时，对应的 SourceID 也会被回收
const bufferToSourceID = new WeakMap();
let sourceCounter = 0;

export class Loader {
    constructor(gl) {
        this.gl = gl;
        this.gltfLoader = new GltfLoader();
    }

    async loadGLB(url, targetScene, modelID) {

        try {
            // 获取二进制数据并建立 SourceID
            const data = await Utils.fetchBinary(url);
            const buffer = data.buffer;

            if (!bufferToSourceID.has(buffer)) {
                bufferToSourceID.set(buffer, `SRC_${sourceCounter++}`);
            }
            const sourceID = bufferToSourceID.get(buffer);

            const blob = new Blob([data]);
            const blobUrl = URL.createObjectURL(blob);

            const asset = await this.gltfLoader.load(blobUrl);
            await asset.preFetchAll();

            // 释放临时 Blob URL
            URL.revokeObjectURL(blobUrl);

            const meshNodesList = [];
            const vaoLibrary = new Map();
            const textureCache = new Map();

            // 1x1 贴图缓存，避免相同材质参数重复创建纹理
            const valueTextureCache = new Map();
            const getOrCreateValueTexture = (key, r, g, b, a = 255) => {
                if (valueTextureCache.has(key)) {
                    return valueTextureCache.get(key);
                }
                const tex = new Texture2D(this.gl);
                tex.uploadData(1, 1, new Uint8Array([r, g, b, a]));
                valueTextureCache.set(key, tex);
                return tex;
            };

            // 1 - 纹理去重加载
            if (asset.gltf.textures) {
                for (let i = 0; i < asset.gltf.textures.length; i++) {
                    const resId = `${sourceID}:TEX:${i}`;

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
            // 基于 SourceID + Accessor 索引去重
            if (asset.gltf.meshes) {
                for (let mIdx = 0; mIdx < asset.gltf.meshes.length; mIdx++) {
                    const gltfMesh = asset.gltf.meshes[mIdx];
                    const meshInstances = [];

                    for (let pIdx = 0; pIdx < gltfMesh.primitives.length; pIdx++) {
                        const prim = gltfMesh.primitives[pIdx];

                        const posIdx = prim.attributes.POSITION;
                        const vaoResId = `${sourceID}:ACC:${posIdx}`;

                        const vao = await targetScene.getOrCreateVAO(vaoResId, async () => {
                            const v = new VAO(this.gl);

                            // POS
                            if (posIdx !== undefined) {
                                const raw = await asset.accessorData(posIdx);
                                v.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 0, 3);
                            }

                            // NORMAL
                            const normIdx = prim.attributes.NORMAL;
                            if (normIdx !== undefined) {
                                const raw = await asset.accessorData(normIdx);
                                v.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 1, 3);
                            }

                            // UV0
                            const uvIdx = prim.attributes.TEXCOORD_0;
                            if (uvIdx !== undefined) {
                                const raw = await asset.accessorData(uvIdx);
                                v.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 2, 2);
                            }

                            // UV1
                            const uv2Idx = prim.attributes.TEXCOORD_1;
                            if (uv2Idx !== undefined) {
                                const raw = await asset.accessorData(uv2Idx);
                                v.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 3, 2);
                            }

                            // JOINT
                            const jIdx = prim.attributes.JOINTS_0;
                            if (jIdx !== undefined) {
                                const raw = await asset.accessorData(jIdx);
                                const accessor = asset.gltf.accessors[jIdx]; // 获取 accessor
                                let jointsData;

                                // 根据 accessor.componentType 选择 TypedArray
                                switch (accessor.componentType) {
                                    case 5121: // UNSIGNED_BYTE
                                        jointsData = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
                                        break;
                                    case 5123: // UNSIGNED_SHORT
                                        jointsData = new Uint16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
                                        break;
                                    default:
                                        console.error(`Vapor3D: Unsupported joint component type: ${accessor.componentType}`);
                                        jointsData = new Uint8Array(0);
                                        break;
                                }

                                // 将整数索引转换为 Float32Array，vao 接收 float 数据
                                const jointsFloat = new Float32Array(jointsData);
                                v.addBuffer(jointsFloat, 4, 4);
                            }

                            // 有关二进制解析的均借助了 AI 编程
                            const wIdx = prim.attributes.WEIGHTS_0; // weight
                            if (wIdx !== undefined) {
                                const raw = await asset.accessorData(wIdx);
                                const accessor = asset.gltf.accessors[wIdx];
                                let weightsFloat;

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

                                for (let i = 0; i < weightsFloat.length; i += 4) {
                                    let sum = weightsFloat[i] + weightsFloat[i + 1] + weightsFloat[i + 2] + weightsFloat[i + 3];
                                    if (sum > 0.0001) {
                                        weightsFloat[i] /= sum;
                                        weightsFloat[i + 1] /= sum;
                                        weightsFloat[i + 2] /= sum;
                                        weightsFloat[i + 3] /= sum;
                                    } else {
                                        // 如果都没有权重，设置第一根为 1.0
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
                        meshInstance.material.hasUV2 = (prim.attributes.TEXCOORD_1 !== undefined);

                        // 材质
                        const mat = meshInstance.material;
                        const matIdx = prim.material;

                        if (matIdx !== undefined && asset.gltf.materials && asset.gltf.materials[matIdx]) {
                            const matData = asset.gltf.materials[matIdx];

                            let baseColor = matData.pbrMetallicRoughness?.baseColorFactor || [1.0, 1.0, 1.0, 1.0];
                            let roughness = matData.pbrMetallicRoughness?.roughnessFactor !== undefined ? matData.pbrMetallicRoughness.roughnessFactor : 1.0;
                            let metallic = matData.pbrMetallicRoughness?.metallicFactor !== undefined ? matData.pbrMetallicRoughness.metallicFactor : 1.0;

                            mat.baseColor = baseColor;

                            // Albedo
                            if (matData.pbrMetallicRoughness?.baseColorTexture) {
                                mat.albedoTex = textureCache.get(matData.pbrMetallicRoughness.baseColorTexture.index);
                            } else {
                                // 没有纹理，创建基于材质 baseColorFactor 的 1x1 静态贴图
                                const r = Math.round(baseColor[0] * 255);
                                const g = Math.round(baseColor[1] * 255);
                                const b = Math.round(baseColor[2] * 255);
                                const a = Math.round(baseColor[3] * 255);
                                mat.albedoTex = getOrCreateValueTexture(`col_${r}_${g}_${b}_${a}`, r, g, b, a);
                            }

                            // ORM
                            if (matData.pbrMetallicRoughness?.metallicRoughnessTexture) {
                                mat.ormTex = textureCache.get(matData.pbrMetallicRoughness.metallicRoughnessTexture.index);
                            } else if (!mat.ormTex && matData.occlusionTexture) {
                                mat.ormTex = textureCache.get(matData.occlusionTexture.index);
                            } else {
                                const r = 255;
                                const g = Math.round(roughness * 255);
                                const b = Math.round(metallic * 255);
                                mat.ormTex = getOrCreateValueTexture(`orm_${g}_${b}`, r, g, b);
                            }

                            // Normal Tex
                            if (matData.normalTexture && matData.normalTexture.index !== undefined) {
                                mat.normalTex = textureCache.get(matData.normalTexture.index);
                            } else {
                                mat.normalTex = getOrCreateValueTexture('default_normal', 128, 128, 255); // [0,0,1]
                            }

                            // Emissive Tex
                            if (matData.emissiveTexture && matData.emissiveTexture.index !== undefined) {
                                mat.emissiveTex = textureCache.get(matData.emissiveTexture.index);
                            } else {
                                mat.emissiveTex = getOrCreateValueTexture('default_emissive', 0, 0, 0);
                            }

                        } else {
                            // 没有材质数据，默认值纯白
                            mat.baseColor = [1.0, 1.0, 1.0, 1.0];
                            mat.albedoTex = getOrCreateValueTexture('default_white', 255, 255, 255);
                            mat.ormTex = getOrCreateValueTexture('default_orm', 255, 255, 0); // AO=1, Roughness=1, Metallic=0
                            mat.normalTex = getOrCreateValueTexture('default_normal', 128, 128, 255);
                            mat.emissiveTex = getOrCreateValueTexture('default_emissive', 0, 0, 0);
                        }

                        meshInstances.push(meshInstance);
                    }
                    vaoLibrary.set(mIdx, meshInstances);
                }
            }

            // 3 - 解析 Node
            const vNodes = asset.gltf.nodes.map((n, i) => {
                const vNode = new TransformNode(n.name || `${modelID}_n${i}`);
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
                    const jointNodes = sDef.joints.map(idx => vNodes[idx]);
                    let ibms = null;
                    if (sDef.inverseBindMatrices !== undefined) {
                        const rawIbm = await asset.accessorData(sDef.inverseBindMatrices);
                        ibms = new Float32Array(rawIbm.buffer, rawIbm.byteOffset, rawIbm.byteLength / 4).slice();
                    }
                    const skel = new Skeleton(this.gl, `${modelID}_skel`, jointNodes, ibms);
                    skeletons.push(skel);
                }
            }

            // 5 - 组装 Node 树
            asset.gltf.nodes.forEach((nDef, i) => {
                const vNode = vNodes[i];
                if (nDef.children) {
                    nDef.children.forEach(cIdx => vNode.addChild(vNodes[cIdx]));
                }
                if (nDef.mesh !== undefined) {
                    const meshInsts = vaoLibrary.get(nDef.mesh);
                    if (meshInsts) {
                        meshInsts.forEach((mInst, pIdx) => {
                            // VAO 已经实现了基于 Accessor 的底层查重，这里直接创建 MeshNode
                            const meshNode = new MeshNode(`${vNode.name}_p${pIdx}`, mInst.vao);
                            meshNode.material = mInst.material;
                            if (nDef.skin !== undefined) {
                                meshNode.skeleton = skeletons[nDef.skin];
                                meshNode.isSkinned = true;
                            }
                            vNode.addChild(meshNode);
                            meshNodesList.push(meshNode);
                        });
                    }
                }
            });

            // 6 - 解析 Animation
            const animations = new Map();
            if (asset.gltf.animations) {
                for (const animDef of asset.gltf.animations) {
                    const samplers = [];
                    for (const samplerDef of animDef.samplers) {
                        const inputData = await asset.accessorData(samplerDef.input);
                        const outputData = await asset.accessorData(samplerDef.output);
                        samplers.push({
                            input: new Float32Array(inputData.buffer, inputData.byteOffset, inputData.byteLength / 4).slice(),
                            output: new Float32Array(outputData.buffer, outputData.byteOffset, outputData.byteLength / 4).slice(),
                            interpolation: samplerDef.interpolation || 'LINEAR',
                        });
                    }
                    const channels = animDef.channels.map(channelDef => {
                        return {
                            sampler: channelDef.sampler,
                            targetNode: vNodes[channelDef.target.node],
                            path: channelDef.target.path,
                        };
                    });
                    const animName = animDef.name || `anim_${animations.size}`;
                    animations.set(animName, new Animation(animName, channels, samplers));
                }
            }

            // 7 - 组装 AssetContainer
            const modelRoot = new TransformNode(modelID);

            // 组装层级树
            const defaultScene = asset.gltf.scenes[asset.gltf.scene || 0];
            if (defaultScene && defaultScene.nodes) {
                defaultScene.nodes.forEach(idx => modelRoot.addChild(vNodes[idx]));
            }

            const container = new AssetContainer(modelID);
            container.rootNode = modelRoot;
            container.meshes = meshNodesList;   // 在 Step 4 中收集的 MeshNode 引用
            container.skeletons = skeletons;    // 解析出的 Skeleton 数组
            container.animations = animations;  // 解析出的 Animation Map
            return container;

        } catch (error) {
            console.error(`\n[Vapor3D: Failed to load GLB : "${modelID}"`);
            console.error(error);
            return null;
        }
    }


    applyLightmapMetadata(container, json) {
        if (!container || !container.meshes) {
            console.error("Vapor3D [Error]: Invalid container or no meshes found to apply lightmap.");
            return 0;
        }

        const metadata = (typeof json === 'string') ? JSON.parse(json) : json;
        if (!metadata || !metadata.items) {
            console.error("Vapor3D [Error]: Lightmap metadata is empty or has no 'items' array.");
            return 0;
        }

        const metaMap = new Map();
        metadata.items.forEach(item => {
            metaMap.set(item.name, item); // 这里 item.name 带有 _p0, _p1
        });

        let appliedCount = 0;
        let missingCount = 0;
        const missingNames = [];

        container.meshes.forEach(meshNode => {
            let searchName = meshNode.name;
            const meta = metaMap.get(searchName);

            if (meta) {
                meshNode.hasLightmap = true;
                meshNode.lightmapIndex = meta.lightmapIndex;

                const sx = meta.scaleOffset[0];
                const sy = meta.scaleOffset[1];
                const ox = meta.scaleOffset[2];
                const oy = meta.scaleOffset[3];

                meshNode.lightmapScaleOffset = [sx, sy, ox, oy];
                appliedCount++;
            } else {
                meshNode.hasLightmap = false;
                meshNode.lightmapIndex = -1;
                missingCount++;

                if (missingNames.length < 10) {
                    missingNames.push(`- ${meshNode.name}`);
                }
            }
        });

        if (missingCount > 0) {
            console.warn(
                `Vapor3D : Lightmap apply completed with warnings.\n` +
                `Missing Metadata: ${missingCount} meshes have NO lightmap data!\n` +
                `First few missing meshes:\n${missingNames.join('\n')}${missingCount > 10 ? '\n...and more.' : ''}`
            );
        } else {
            console.log(`Vapor3D: All ${appliedCount} meshes successfully mapped.`);
        }

        return appliedCount;
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

    // 加载 HDR
    async loadHDRTexture(url) {
        const data = await Utils.fetchBinary(url);
        const hdrData = Utils.parseHDR(data.buffer);
        const tex = new Texture2D(this.gl);
        tex.uploadHDR(hdrData);
        return tex;
    }
}