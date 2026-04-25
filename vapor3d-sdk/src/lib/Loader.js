import { GltfLoader } from 'gltf-loader-ts';
import { VAO } from './VAO.js';
import { Texture2D, TextureCube } from './Textures.js';
import { Model, Mesh } from './Model.js';
import { Utils } from './Utils.js';

export class Loader {
    /**
     * @param {WebGL2RenderingContext} gl 只需要底层 GL 上下
     */
    constructor(gl) {
        this.gl = gl;
        this.gltfLoader = new GltfLoader();
    }

    /**
     * @returns {Promise<Model>} 返回一个完全组装好的模型实体
     */
    async loadGLB(url, modelName = "Unnamed") {
        let loadUrl = String(url).trim();
        if (loadUrl.length > 200 && !loadUrl.startsWith('http') && !loadUrl.startsWith('data:')) {
            loadUrl = 'data:application/octet-stream;base64,' + loadUrl;
        }

        const asset = await this.gltfLoader.load(loadUrl);
        await asset.preFetchAll();

        const model = new Model(modelName);
        const textureCache = new Map(); // 用于模型内部的纹理复用

        // 内部提取纹理辅助函数
        const extractTexture = async (texIdx) => {
            if (textureCache.has(texIdx)) return textureCache.get(texIdx);

            const texture = asset.gltf.textures[texIdx];
            if (!texture) return null;

            let imgIdx = texture.source;
            if (imgIdx === undefined && texture.extensions) {
                for (const extName in texture.extensions) {
                    if (texture.extensions[extName] && typeof texture.extensions[extName].source === 'number') {
                        imgIdx = texture.extensions[extName].source;
                        break;
                    }
                }
            }
            if (imgIdx === undefined) return null;

            const rawImg = await asset.imageData.get(imgIdx);
            const img = (rawImg && rawImg.image) ? rawImg.image : rawImg;
            if (!img || img.width === 0) return null;

            const tex2D = new Texture2D(this.gl);
            tex2D.uploadImageBitmap(img);
            tex2D.generateMipmap();
            tex2D.setFilter("LINEAR_MIPMAP_LINEAR", "LINEAR");

            textureCache.set(texIdx, tex2D);
            model.textures.push(tex2D); // 交由模型统一生命周期管理
            return tex2D;
        };

        let flatIdx = 0;

        for (const gltfMesh of asset.gltf.meshes) {
            for (const prim of gltfMesh.primitives) {
                const vao = new VAO(this.gl);

                // Position
                const posIdx = prim.attributes.POSITION;
                if (posIdx !== undefined) {
                    const rawPos = await asset.accessorData(posIdx);
                    const positions = new Float32Array(rawPos.buffer, rawPos.byteOffset, rawPos.byteLength / 4).slice();
                    vao.addBuffer(positions, 0, 3);
                }

                // Normal
                const normIdx = prim.attributes.NORMAL;
                if (normIdx !== undefined) {
                    const rawNorm = await asset.accessorData(normIdx);
                    const normals = new Float32Array(rawNorm.buffer, rawNorm.byteOffset, rawNorm.byteLength / 4).slice();
                    vao.addBuffer(normals, 1, 3);
                }

                // UV
                const uvIdx = prim.attributes.TEXCOORD_0;
                if (uvIdx !== undefined) {
                    const rawUV = await asset.accessorData(uvIdx);
                    const uvs = new Float32Array(rawUV.buffer, rawUV.byteOffset, rawUV.byteLength / 4).slice();
                    vao.addBuffer(uvs, 2, 2);
                }

                // UV2
                let hasUV2 = false;
                const uv2Idx = prim.attributes.TEXCOORD_1;
                if (uv2Idx !== undefined) {
                    const rawUV2 = await asset.accessorData(uv2Idx);
                    const uv2s = new Float32Array(rawUV2.buffer, rawUV2.byteOffset, rawUV2.byteLength / 4).slice();
                    vao.addBuffer(uv2s, 3, 2);
                    hasUV2 = true;
                }

                // Indices
                if (prim.indices !== undefined) {
                    const rawIndices = await asset.accessorData(prim.indices);
                    const accessor = asset.gltf.accessors[prim.indices];
                    const isUint32 = accessor.componentType === 5125;
                    const indices = isUint32
                        ? new Uint32Array(rawIndices.buffer, rawIndices.byteOffset, rawIndices.byteLength / 4).slice()
                        : new Uint16Array(rawIndices.buffer, rawIndices.byteOffset, rawIndices.byteLength / 2).slice();
                    vao.setIndices(indices, isUint32);
                } else {
                    vao.defaultCount = vao.vbos.length > 0 ? (await asset.accessorData(posIdx)).byteLength / 12 : 0;
                }

                // 创建 Mesh 实例
                const mesh = new Mesh(gltfMesh.name || `mesh_${flatIdx}`, vao);
                mesh.material.hasUV2 = hasUV2;

                // 材质与纹理
                const matIdx = prim.material;
                if (matIdx !== undefined && asset.gltf.materials && asset.gltf.materials[matIdx]) {
                    const matData = asset.gltf.materials[matIdx];
                    if (matData.pbrMetallicRoughness) {
                        const pbr = matData.pbrMetallicRoughness;
                        if (pbr.baseColorFactor) mesh.material.baseColor = pbr.baseColorFactor;
                        if (pbr.roughnessFactor !== undefined) mesh.material.roughness = pbr.roughnessFactor;
                        if (pbr.metallicFactor !== undefined) mesh.material.metalness = pbr.metallicFactor;

                        if (pbr.baseColorTexture) mesh.material.albedoTex = await extractTexture(pbr.baseColorTexture.index);
                        if (pbr.metallicRoughnessTexture) mesh.material.ormTex = await extractTexture(pbr.metallicRoughnessTexture.index);
                    }
                    if (matData.normalTexture) mesh.material.normalTex = await extractTexture(matData.normalTexture.index);
                    if (matData.emissiveTexture) mesh.material.emissiveTex = await extractTexture(matData.emissiveTexture.index);
                }

                model.addMesh(mesh);
                flatIdx++;
            }
        }

        return model;
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