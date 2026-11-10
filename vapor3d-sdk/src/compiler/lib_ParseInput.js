// NOTE: THIS SHOULD BE UP-TO-DATE
// maybe we should create a prebuild script to generate this file?

export const LIB_PARSEVEC3 = (libSafeArray) => `
    function(input) {
        if (input instanceof ${libSafeArray}) return input.underlying;

        if (typeof input === "string" && input.startsWith("[")) {
            const array = ${libSafeArray}.createWithString(input);
            return array ? array.underlying : [0,0,0];
        }
        // 如果 input 是列表名，从 Scratch 运行时查找
        const list = target.lookupVariableByNameAndType(input, "list");
        return list ? list.value.map(Number) : [0,0,0];
    }
`;

export const LIB_PARSEMAT4 = (libSafeArray) => `
    function(input) {
        if (input instanceof ${libSafeArray}) return input.underlying;

        if (typeof input === "string" && input.startsWith("[")) {
            const array = ${libSafeArray}.createWithString(input);
            return array ? array.underlying : [1,0,0,0,
                                               0,1,0,0,
                                               0,0,1,0,
                                               0,0,0,1];
        }
        // 如果 input 是列表名，从 Scratch 运行时查找
        const list = target.lookupVariableByNameAndType(input, "list");
        return list ? list.value.map(Number) : [1,0,0,0,
                                                0,1,0,0,
                                                0,0,1,0,
                                                0,0,0,1];
    }
`;
