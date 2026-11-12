// /lib/Loader/Loader.js

import { GltfLoader } from 'gltf-loader-ts';

import {
    Primitive, Material, Mesh,
    VAO, Texture2D, TextureCube,
    Math3D, Utils, Skeleton, Animation,
    TransformNode, MeshNode, AssetContainer
} from '../index.js';


export class Loader {
    constructor(gl, registry) {
        this.gl = gl;
        this.gltfLoader = new GltfLoader();
        this.registry = registry;
    }

    async loadGLB(url, targetScene, modelID) {
        try {
            const asset = await this.gltfLoader.load(url);
            await asset.preFetchAll();

            console.log({
                gltfTextures: asset.gltf.textures?.length ?? 0,
                gltfImages: asset.gltf.images?.length ?? 0,
                registryTextures: this.registry.textures?.length
            });

            const sourceID = `MODEL_${modelID}`;
            const meshNodesList = [];

            // 1x1 占位贴图
            const valueTextureCache = new Map();
            const getOrCreateValueTexture = (key, r, g, b, a = 255) => {
                if (valueTextureCache.has(key)) {
                    return valueTextureCache.get(key);
                }
                const tex = new Texture2D(this.gl);
                tex.uploadData(1, 1, new Uint8Array([r, g, b, a]));

                reg('textures', tex);

                valueTextureCache.set(key, tex);
                return tex;
            };

            // 注册到 Registry 并标记索引
            const reg = (type, obj) => {
                const idx = this.registry.allocate(type, obj);
                obj.registryIndex = idx;
                return idx;
            };

            /*
            Texture
            */
            const textures = [];
            if (asset.gltf.textures) {
                for (let i = 0; i < asset.gltf.textures.length; i++) {
                    const texDef = asset.gltf.textures[i];
                    if (!texDef) { textures[i] = null; continue; }

                    // image source
                    let imgIdx = texDef.source;
                    if (imgIdx === undefined && texDef.extensions) {
                        for (const k in texDef.extensions) {
                            if (texDef.extensions[k].source !== undefined) {
                                imgIdx = texDef.extensions[k].source;
                                break;
                            }
                        }
                    }
                    if (imgIdx === undefined) { textures[i] = null; continue; }

                    const rawImg = await asset.imageData.get(imgIdx);
                    const img = (rawImg && rawImg.image) ? rawImg.image : rawImg;
                    if (!img || img.width === 0) { textures[i] = null; continue; }

                    const t = new Texture2D(this.gl);
                    reg('textures', t);
                    t.uploadImageBitmap(img);
                    t.generateMipmap();
                    t.setFilter("LINEAR_MIPMAP_LINEAR", "LINEAR");
                    textures[i] = t;
                }
            }

            /*
            Material
            one per gltf index
            */
            const materials = [];

            const buildMaterial = (matData, fallbackName) => {
                const mat = new Material();

                const pbr = matData.pbrMetallicRoughness;
                let baseColor = pbr?.baseColorFactor || [1.0, 1.0, 1.0, 1.0];
                let roughness = pbr?.roughnessFactor !== undefined ? pbr.roughnessFactor : 1.0;
                let metallic = pbr?.metallicFactor !== undefined ? pbr.metallicFactor : 1.0;

                mat.baseColor = baseColor;
                mat.roughness = roughness;
                mat.metalness = metallic;
                mat.alpha = baseColor[3];

                // Albedo Tex
                if (pbr?.baseColorTexture) {
                    mat.albedoTex = textures[pbr.baseColorTexture.index];
                } else {
                    const r = Math.round(baseColor[0] * 255);
                    const g = Math.round(baseColor[1] * 255);
                    const b = Math.round(baseColor[2] * 255);
                    const a = Math.round(baseColor[3] * 255);
                    mat.albedoTex = getOrCreateValueTexture(`col_${r}_${g}_${b}_${a}`, r, g, b, a);
                }

                // ORM: metallicRoughness first, occlusion as fallback
                if (pbr?.metallicRoughnessTexture) {
                    mat.ormTex = textures[pbr.metallicRoughnessTexture.index];
                } else if (matData.occlusionTexture) {
                    mat.ormTex = textures[matData.occlusionTexture.index];
                } else {
                    const r = 255;
                    const g = Math.round(roughness * 255);
                    const b = Math.round(metallic * 255);
                    mat.ormTex = getOrCreateValueTexture(`orm_${g}_${b}`, r, g, b);
                }

                // Normal Tex
                const nrmIdx = matData.normalTexture?.index;
                mat.normalTex = (nrmIdx !== undefined && textures[nrmIdx])
                    ? textures[nrmIdx]
                    : getOrCreateValueTexture('default_normal', 128, 128, 255);

                // Emissive Tex
                const emiIdx = matData.emissiveTexture?.index;
                mat.emissiveTex = (emiIdx !== undefined && textures[emiIdx])
                    ? textures[emiIdx]
                    : getOrCreateValueTexture('default_emissive', 0, 0, 0);

                mat.name = matData.name || fallbackName;
                return mat;
            };

            // shared fallback for primitives without a gltf material, built lazily
            let defaultMaterial = null;
            const getDefaultMaterial = () => {
                if (defaultMaterial) return defaultMaterial;

                defaultMaterial = new Material();
                defaultMaterial.name = `${sourceID}:MAT:default`;
                defaultMaterial.baseColor = [1.0, 1.0, 1.0, 1.0];
                defaultMaterial.alpha = 1;
                defaultMaterial.albedoTex = getOrCreateValueTexture('default_white', 255, 255, 255);
                defaultMaterial.ormTex    = getOrCreateValueTexture('default_orm', 255, 255, 0);
                defaultMaterial.normalTex = getOrCreateValueTexture('default_normal', 128, 128, 255);
                defaultMaterial.emissiveTex = getOrCreateValueTexture('default_emissive', 0, 0, 0);

                reg('materials', defaultMaterial);
                return defaultMaterial;
            };

            if (asset.gltf.materials) {
                for (let i = 0; i < asset.gltf.materials.length; i++) {
                    const mat = buildMaterial(asset.gltf.materials[i], `${sourceID}:MAT:${i}`);
                    reg('materials', mat);
                    materials[i] = mat;
                }
            }

            /*
            Mesh
            one gltf mesh -> one Mesh, one primitive -> one VAO + Material ref
            */
            const meshes = [];

            if (asset.gltf.meshes) {
                for (let mIdx = 0; mIdx < asset.gltf.meshes.length; mIdx++) {
                    const gltfMesh = asset.gltf.meshes[mIdx];
                    const mesh = new Mesh(gltfMesh.name || `${modelID}_mesh${mIdx}`);

                    for (let pIdx = 0; pIdx < gltfMesh.primitives.length; pIdx++) {
                        const prim = gltfMesh.primitives[pIdx];
                        const vao = new VAO(this.gl);
                        reg('vaos', vao);

                        // POS
                        const posIdx = prim.attributes.POSITION;
                        if (posIdx !== undefined) {
                            const raw = await asset.accessorData(posIdx);
                            vao.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 0, 3);
                        }

                        // NORMAL
                        const normIdx = prim.attributes.NORMAL;
                        if (normIdx !== undefined) {
                            const raw = await asset.accessorData(normIdx);
                            vao.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 1, 3);
                        }

                        // UV0
                        const uvIdx = prim.attributes.TEXCOORD_0;
                        if (uvIdx !== undefined) {
                            const raw = await asset.accessorData(uvIdx);
                            vao.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 2, 2);
                        }

                        // UV1
                        const uv2Idx = prim.attributes.TEXCOORD_1;
                        if (uv2Idx !== undefined) {
                            const raw = await asset.accessorData(uv2Idx);
                            vao.addBuffer(new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice(), 3, 2);
                        }

                        // JOINT
                        const jIdx = prim.attributes.JOINTS_0;
                        if (jIdx !== undefined) {
                            const raw = await asset.accessorData(jIdx);
                            const accessor = asset.gltf.accessors[jIdx]; // 获取 accessor
                            let jointsData;

                            // accessor.componentType -> TypedArray
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

                            const jointsFloat = new Float32Array(jointsData);
                            vao.addBuffer(jointsFloat, 4, 4);
                        }

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

                            vao.addBuffer(weightsFloat, 5, 4);
                        }

                        /*
                        Indices
                        */
                        if (prim.indices !== undefined) {
                            const raw = await asset.accessorData(prim.indices);
                            const acc = asset.gltf.accessors[prim.indices];
                            const is32 = acc.componentType === 5125;
                            const arr = is32
                                ? new Uint32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice()
                                : new Uint16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2).slice();
                            vao.setIndices(arr, is32 ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT);
                        } else if (posIdx !== undefined) {
                            // no index buffer, derive vertex count from POSITION
                            const raw = await asset.accessorData(posIdx);
                            vao.defaultCount = raw.byteLength / 12;
                        }

                        /*
                        Material
                        */
                        const mat = (prim.material !== undefined && materials[prim.material])
                            ? materials[prim.material]
                            : getDefaultMaterial();

                        // a shared material turns on UV2 if any of its primitives has TEXCOORD_1
                        if (prim.attributes.TEXCOORD_1 !== undefined) {
                            mat.hasUV2 = true;
                        }

                        const primitive = new Primitive(vao, mat);
                        reg('primitives', primitive);
                        mesh.primitives.push(primitive);
                    }

                    reg('meshes', mesh);
                    meshes[mIdx] = mesh;
                }
            }

            /*
            Node
            */
            const vNodes = asset.gltf.nodes.map((n, i) => {
                let vNode;
                if (n.mesh !== undefined && meshes[n.mesh]) {
                    vNode = new MeshNode(n.name || `${modelID}_n${i}`, meshes[n.mesh]);
                } else {
                    vNode = new TransformNode(n.name || `${modelID}_n${i}`);
                }

                if (n.matrix) {
                    const { t, q, s } = Math3D.mat4_decompose(n.matrix);
                    vNode.position = t; vNode.quaternion = q; vNode.scale = s;
                } else {
                    vNode.position = n.translation ? [...n.translation] : [0, 0, 0];
                    vNode.quaternion = n.rotation ? [...n.rotation] : [0, 0, 0, 1];
                    vNode.scale = n.scale ? [...n.scale] : [1, 1, 1];
                }
                reg('nodes', vNode);
                return vNode;
            });

            /*
            Skin
            */
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
                    reg('skeletons', skel);
                    skeletons.push(skel);
                }
            }

            /*
            Assemble node tree
            */
            asset.gltf.nodes.forEach((nDef, i) => {
                const vNode = vNodes[i];
                if (nDef.children) {
                    nDef.children.forEach(cIdx => vNode.addChild(vNodes[cIdx]));
                }

                if (vNode instanceof MeshNode) {
                    if (nDef.skin !== undefined && skeletons[nDef.skin]) {
                        vNode.skeleton = skeletons[nDef.skin];
                        vNode.isSkinned = true;
                    }
                    meshNodesList.push(vNode);
                }
            });

            /*
            Animation
            */
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
                    const animationInstance = new Animation(animName, channels, samplers);
                    reg('animations', animationInstance);
                    animations.set(animName, animationInstance);
                }
            }

            /*
            Assemble AssetContainer
            */
            const modelRoot = new TransformNode(modelID);
            reg('nodes', modelRoot);

            // Assemble Scene nodes tree
            const defaultScene = asset.gltf.scenes[asset.gltf.scene || 0];
            if (defaultScene && defaultScene.nodes) {
                defaultScene.nodes.forEach(idx => modelRoot.addChild(vNodes[idx]));
            }

            const container = new AssetContainer(modelID);
            container.rootNode = modelRoot;
            container.meshes = meshNodesList;   // MeshNodes Array, convenient to getMesh by index
            container.skeletons = skeletons;    // Skeletons Array
            container.animations = animations;  // Animations Map
            reg('containers', container);       // register to Registry
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
            metaMap.set(item.name, item);

            // lightmap is per mesh
            const baseName = item.name.replace(/_p\d+$/, '');
            if (baseName !== item.name && !metaMap.has(baseName)) {
                metaMap.set(baseName, item);
            }
        });

        let appliedCount = 0;
        let missingCount = 0;
        const missingNames = [];

        container.meshes.forEach(meshNode => {
            const meta = metaMap.get(meshNode.name);

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