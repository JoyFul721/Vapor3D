export const CubeCameraBlocks = [
    {
        opcode: "CubeCam_GetViewMatrix",
        blockType: "reporter",
        text: "CubeCam.viewMatrix([X] [Y] [Z], [FACE])",
        arguments: {
            X: { type: "number", defaultValue: 0 },
            Y: { type: "number", defaultValue: 0 },
            Z: { type: "number", defaultValue: 0 },
            FACE: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "CubeCam_GetProjection",
        blockType: "reporter",
        text: "CubeCam.projectionMatrix()"
    }
];