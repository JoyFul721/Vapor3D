export const TextBlocks = [
    {
        opcode: "Text_Create",
        blockType: "command",
        text: "new Text([NAME], [TEXT], [FONT], [COLOR], [B_COLOR], [SIZE])",
        arguments: {
            NAME: { type: "string", defaultValue: "text1" },
            TEXT: { type: "string", defaultValue: "Hello!" },
            FONT: { type: "string", defaultValue: "32px sans-serif" },
            COLOR: { type: "color", defaultValue: "#ffffff" },
            SIZE: { type: "number", defaultValue: 0 },
            B_COLOR: { type: "color", defaultValue: "#000000" }
        }
    },
    {
        opcode: "Text_GetWidth",
        blockType: "reporter",
        text: "width of text [TEXT] font [FONT] size [BORDER_SIZE]",
        arguments: {
            TEXT: { type: "string", defaultValue: "Hello!" },
            FONT: { type: "string", defaultValue: "32px sans-serif" },
            BORDER_SIZE: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Text_GetHeight",
        blockType: "reporter",
        text: "height of text [TEXT] font [FONT] size [BORDER_SIZE]",
        arguments: {
            TEXT: { type: "string", defaultValue: "Hello!" },
            FONT: { type: "string", defaultValue: "32px sans-serif" },
            BORDER_SIZE: { type: "number", defaultValue: 0 }
        }
    }
]