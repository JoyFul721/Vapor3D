export const InspectorBlocks = [
    {
        opcode: "Inspector_Find",
        blockType: "reporter",
        text: "find [TYPE] [NAME]",
        arguments: {
            TYPE: { type: "string", menu: "Inspector_GlobalType" },
            NAME: { type: "string", defaultValue: "" }
        }
    },
    {
        opcode: "Inspector_SceneFind",
        blockType: "reporter",
        text: "Scene [SCENE_INDEX] .find [TYPE] [NAME]",
        arguments: {
            SCENE_INDEX: { type: "number", defaultValue: 0 },
            TYPE: { type: "string", menu: "Inspector_SceneType" },
            NAME: { type: "string", defaultValue: "" }
        }
    },
    {
        opcode: "Inspector_ContainerFind",
        blockType: "reporter",
        text: "Container [CONTAINER_INDEX] .find [TYPE] [NAME]",
        arguments: {
            CONTAINER_INDEX: { type: "number", defaultValue: 0 },
            TYPE: { type: "string", menu: "Inspector_ContainerType" },
            NAME: { type: "string", defaultValue: "" }
        }
    },
    {
        opcode: "Inspector_ContainerGet",
        blockType: "reporter",
        text: "Container [CONTAINER_INDEX] .get [TYPE] index [RESOURCE_INDEX]",
        arguments: {
            CONTAINER_INDEX: { type: "string", defaultValue: "0" },
            TYPE: { type: "string", menu: "Inspector_ContainerArrayType" },
            RESOURCE_INDEX: { type: "string", defaultValue: "0" }
        }
    },
    {
        opcode: "Inspector_MeshFind",
        blockType: "reporter",
        text: "MeshNode [CONTAINER_INDEX] .find [TYPE] [NAME]",
        arguments: {
            CONTAINER_INDEX: { type: "number", defaultValue: 0 },
            TYPE: { type: "string", menu: "Inspector_MeshType" },
            NAME: { type: "string", defaultValue: "" }
        }
    },
    {
        opcode: "Inspector_ConsolePrint",
        blockType: "command",
        text: "print to console"
    },
    "---",
    "---"
];