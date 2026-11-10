export class CompilerPatcher {
    constructor(vmUnsafeExports) {
        if (!vmUnsafeExports) {
            throw new Error(
                "cannot patch compiler! there's no unsafe exports in Scratch.vm",
            );
        }
        this.vmUnsafeExports = vmUnsafeExports;
        this.blocksCanCompile = {};
    }

    addBlocks(blocks) {
        blocks.forEach((block) => {
            if (block.opcode && block.compile) {
                const opcode = "vapor3D_" + block.opcode;
                this.blocksCanCompile[opcode] = {
                    opcode,
                    compile: block.compile,
                    arguments: Object.keys(block.arguments ?? {}),
                    isReporter: block.blockType === "reporter",
                };
            }
        });
    }

    monkeyPatch() {
        const patch = (obj, functions) => {
            for (const name in functions) {
                const original = obj[name];
                if (original) {
                    obj[name] = function (...args) {
                        const callOriginal = (...args) =>
                            original.call(this, ...args);
                        return functions[name].call(
                            this,
                            callOriginal,
                            ...args,
                        );
                    };
                } else {
                    obj[name] = function (...args) {
                        return functions[name].call(this, () => {}, ...args);
                    };
                }
            }
        };

        const that = this;

        patch(this.vmUnsafeExports.ScriptTreeGenerator.prototype, {
            descendStackedBlock(original, block) {
                const blockInfo = that.blocksCanCompile[block.opcode];
                if (blockInfo && !blockInfo.isReporter) {
                    return {
                        kind: blockInfo.opcode,
                        ...Object.fromEntries(
                            blockInfo.arguments.map((argumentName) => {
                                const field = block.fields[argumentName];
                                if (field) return [argumentName, field.value];
                                return [
                                    argumentName,
                                    this.descendInputOfBlock(
                                        block,
                                        argumentName,
                                    ),
                                ];
                            }),
                        ),
                    };
                } else {
                    return original(block);
                }
            },
            descendInput(original, block) {
                const blockInfo = that.blocksCanCompile[block.opcode];
                if (blockInfo) {
                    return {
                        kind: blockInfo.opcode,
                        ...Object.fromEntries(
                            blockInfo.arguments.map((argumentName) => {
                                const field = block.fields[argumentName];
                                if (field) return [argumentName, field.value];
                                return [
                                    argumentName,
                                    this.descendInputOfBlock(
                                        block,
                                        argumentName,
                                    ),
                                ];
                            }),
                        ),
                    };
                } else {
                    return original(block);
                }
            },
        });

        patch(this.vmUnsafeExports.JSGenerator.prototype, {
            descendStackedBlock(original, node) {
                const blockInfo = that.blocksCanCompile[node.kind];
                if (blockInfo && !blockInfo.isReporter) {
                    return blockInfo.compile.call(
                        this,
                        node,
                        that.vmUnsafeExports,
                    );
                } else {
                    return original(node);
                }
            },
            descendInput(original, node) {
                const blockInfo = that.blocksCanCompile[node.kind];
                if (blockInfo) {
                    return blockInfo.compile.call(
                        this,
                        node,
                        that.vmUnsafeExports,
                    );
                } else {
                    return original(node);
                }
            },
        });
    }
}
