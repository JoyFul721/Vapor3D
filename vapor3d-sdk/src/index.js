import { EngineBlocks, EngineMenus } from './blocks/Engine_b.js';
import { SceneBlocks } from './blocks/Scene_b.js';
import { LoaderBlocks} from './blocks/Loader_b.js';
import { Math3DBlocks } from './blocks/Math3D_b.js';
import { CubeCameraBlocks} from './blocks/CubeCamera_b.js';
import { TextBlocks } from './blocks/Text_b.js';

import { EngineHandlers } from './handlers/Engine_h.js';
import { SceneHandlers } from './handlers/Scene_h.js';
import { LoaderHandlers } from './handlers/Loader_h.js';
import { Math3DHandlers } from './handlers/Math3D_h.js';
import { CubeCameraHandlers } from './handlers/CubeCamera_h.js';
import { TextHandlers } from './handlers/Text_h.js';

(function (Scratch) {
    "use strict";
    if (!Scratch.extensions.unsandboxed) throw new Error("Vapor3D must run unsandboxed");

    const vm = Scratch.vm;
    const runtime = Scratch.vm.runtime;
    const Cast = Scratch.Cast;

    class Vapor3DExtension {
        constructor() {
            // 所有 Handler
            this.engineHandlers = new EngineHandlers(Scratch);
            this.sceneHandlers = new SceneHandlers(this.engineHandlers);
            this.loaderHandlers = new LoaderHandlers(this.engineHandlers, this.sceneHandlers);
            this.mathHandlers = new Math3DHandlers();
            this.cubeCameraHandlers = new CubeCameraHandlers();
            this.testHandlers = new TextHandlers(this.engineHandlers, Cast);

            runtime.on('PROJECT_STOP_ALL', () => {
                console.log("Vapor3D: Project stopped. releasing all resources...");

                this.sceneHandlers.Scene_Clear();
                this.engineHandlers.gl_ResetResources();

                /*
                if (this.engineHandlers.core) {
                    const gl = this.engineHandlers.core.gl;
                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
                }
                */
            });

            // 绑定所有 Handler 方法到扩展实例
            const bindMethods = (instance) => {
                const proto = Object.getPrototypeOf(instance);
                Object.getOwnPropertyNames(proto).forEach(method => {
                    if (method !== 'constructor' && typeof instance[method] === 'function') {
                        this[method] = instance[method].bind(instance);
                    }
                });
            };

            bindMethods(this.engineHandlers);
            bindMethods(this.sceneHandlers);
            bindMethods(this.loaderHandlers);
            bindMethods(this.mathHandlers);
            bindMethods(this.cubeCameraHandlers);
            bindMethods(this.testHandlers);
        }

        getInfo() {
            return {
                id: 'vapor3D',
                name: 'Vapor 3D',
                color1: "#2f2f36",
                hideFromPalette: true,
                blocks: [
                    ...EngineBlocks,
                    "---",
                    ...SceneBlocks,
                    "---",
                    ...LoaderBlocks,
                    "---",
                    ...Math3DBlocks,
                    "---",
                    ...CubeCameraBlocks,
                    "---",
                    ...TextBlocks,
                ],
                menus: {
                    ...EngineMenus,
                }
            };
        }
    }
    

    // ==========================================
    // 包映射，侧边栏分类注入
    // ==========================================
    const originalGetBlocksXML = vm.runtime.getBlocksXML;

    vm.runtime.getBlocksXML = function (target) {
        const res = originalGetBlocksXML.call(this, target);

        try {
            const ext = this._blockInfo.find(info => info.id === "vapor3D");
            if (!ext) return res;

            const allBlocks = ext.blocks;

            // 定义子类别映射
            const groupDefinitions = [
                { name: "Engine", data: EngineBlocks, color: "#2f2f36" },
                { name: "Scene", data: SceneBlocks, color: "#3a3a42" },
                { name: "Loader", data: LoaderBlocks, color: "#45454d" },
                { name: "CubeCamera", data: CubeCameraBlocks, color: "#505058" },
                { name: "Math", data: Math3DBlocks, color: "#5a5a63" },
                { name: "Text", data: TextBlocks, color: "#6d6d77" },
            ];

            // 构建每个子类别的 XML
            groupDefinitions.forEach(group => {
                const groupXml = group.data.map(def => {
                    if (def === "---") return '<sep gap="36"/>';
                    if (typeof def === 'object' && def.blockType === 'label') {
                        return `<label text="${def.text}"/>`;
                    }
                    if (def.opcode) {
                        const b = allBlocks.find(ab => ab.info.opcode === def.opcode);

                        if (!b) {
                            console.error(`Vapor3D XML："${def.opcode}"loading failed`);
                            return '';
                        }
                        return b.xml || '';
                    }
                    return '';

                }).join('');

                if (groupXml) {
                    res.push({
                        id: `v3d_cat_${group.name.toLowerCase()}`,
                        xml: `<category name="${group.name}" id="v3d_cat_${group.name.toLowerCase()}" colour="${group.color}" secondaryColour="${group.color}">${groupXml}</category>`
                    });
                }
            });

            // 只显示注入的子类别
            return res.filter(item => item.id !== "vapor3D");
        } catch (e) {
            console.error("Vapor3D: Category Injection Error:", e);
        }
        return res;
    };

    Scratch.extensions.register(new Vapor3DExtension());
})(Scratch);