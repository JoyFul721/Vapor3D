import { EngineBlocks, EngineMenus } from './blocks/Engine_b.js';
import { SceneBlocks } from './blocks/Scene_b.js';
import { LoaderBlocks } from './blocks/Loader_b.js';
import { Math3DBlocks } from './blocks/Math3D_b.js';
import { CubeCameraBlocks } from './blocks/CubeCamera_b.js';
import { TextBlocks } from './blocks/Text_b.js';
import { AnimationPlayerBlocks } from './blocks/AnimationPlayer_b.js';

import { EngineHandlers } from './handlers/Engine_h.js';
import { SceneHandlers } from './handlers/Scene_h.js';
import { LoaderHandlers } from './handlers/Loader_h.js';
import { Math3DHandlers } from './handlers/Math3D_h.js';
import { CubeCameraHandlers } from './handlers/CubeCamera_h.js';
import { TextHandlers } from './handlers/Text_h.js';
import { AnimationPlayerHandlers } from './handlers/AnimationPlayer_h.js';

(function (Scratch) {
    "use strict";
    if (!Scratch.extensions.unsandboxed) throw new Error("Vapor3D must run unsandboxed");

    const vm = Scratch.vm;
    const runtime = vm.runtime || Scratch.runtime;
    const Cast = Scratch.Cast;

    // For CCW
    
    if (vm && !vm.renderer && runtime.renderer) {
        console.log("Vapor3D CCW Environment Detected. Applying Shims...");

        vm.renderer = runtime.renderer;

        if (!vm.renderer.canvas) {
            Object.defineProperty(vm.renderer, 'canvas', {
                get: function () {
                    return this._gl?.canvas || runtime._gl?.canvas || document.querySelector('canvas');
                },
                enumerable: true,
                configurable: true
            });
        }
    } else {
        console.log("Vapor3D Standard TurboWarp Environment Detected.");
    }

    // 对于 ccw：从vm.runtime.renderer._gl.canvas  提前到  vm.renderer.canvas 

    class Vapor3DExtension {
        constructor() {
            this.engineHandlers = new EngineHandlers(Scratch);
            this.sceneHandlers = new SceneHandlers(this.engineHandlers);
            this.loaderHandlers = new LoaderHandlers(this.engineHandlers, this.sceneHandlers);
            this.mathHandlers = new Math3DHandlers();
            this.cubeCameraHandlers = new CubeCameraHandlers();
            this.testHandlers = new TextHandlers(this.engineHandlers, Cast);
            this.animationPlayerHandlers = new AnimationPlayerHandlers(this.engineHandlers, this.sceneHandlers);



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
            bindMethods(this.animationPlayerHandlers);
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
                    ...AnimationPlayerBlocks,
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
            if (!this._blockInfo || !Array.isArray(this._blockInfo)) return res;

            const ext = this._blockInfo.find(info => info && info.id === "vapor3D");

            if (!ext || !ext.blocks) return res;

            const allBlocks = ext.blocks;

            // 定义子类别映射
            const groupDefinitions = [
                { name: "Engine", data: EngineBlocks, color: "#2f2f36" },
                { name: "Scene", data: SceneBlocks, color: "#36363d" },
                { name: "AnimPlayer", data: AnimationPlayerBlocks, color: "#3d3d45" },
                { name: "Loader", data: LoaderBlocks, color: "#45454d" },
                { name: "CubeCamera", data: CubeCameraBlocks, color: "#4d4d55" },
                { name: "Math", data: Math3DBlocks, color: "#54545c" },
                { name: "Text", data: TextBlocks, color: "#5a5a63" }
            ];

            // 构建每个子类别的 XML
            groupDefinitions.forEach(group => {
                const groupXml = group.data.map(def => {
                    if (def === "---") return '<sep gap="36"/>';
                    if (typeof def === 'object' && def.blockType === 'label') {
                        return `<label text="${def.text}"/>`;
                    }
                    if (def.opcode) {
                        const b = allBlocks.find(ab => ab && ab.info && ab.info.opcode === def.opcode);
                        if (!b) return '';
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

            return res.map(item => {
                if (item.id === "vapor3D") {
                    // 保留 Vapor 3D 的名字，但清空其内部积木
                    // 占位符，防止 ccw 发布检查时报错
                    return {
                        id: "vapor3D",
                        xml: `<category name="Vapor 3D" id="vapor3D" colour="#2f2f36" secondaryColour="#2f2f36"></category>`
                    };
                }
                return item;
            });

        } catch (e) {
            return res;
        }
    };

    Scratch.extensions.register(new Vapor3DExtension());
})(Scratch);