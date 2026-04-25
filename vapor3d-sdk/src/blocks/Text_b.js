export const TextBlocks = [
    {
        opcode: "Text_Create",
        blockType: "command",
        text: "Text.create([NAME], [TEXT], [FONT], [COLOR], [B_COLOR], [SIZE])",
        arguments: {
            NAME: { type: "string", defaultValue: "text1" },
            TEXT: { type: "string", defaultValue: "Hello!" },
            FONT: { type: "string", defaultValue: "32px sans-serif" },
            COLOR: { type: "color", defaultValue: "#ffffff" },
            SIZE: { type: "number", defaultValue: 0 },
            B_COLOR: { type: "color", defaultValue: "#000000" }
        }
    }
]