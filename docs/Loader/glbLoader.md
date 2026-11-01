# GLB Loader

## 加载 GLB

![加载 GLB](/blocks/vapor3D_Loader_load_glb.svg)

加载 GLB 模型，并将生成的 Container 自挂载到指定 Scene。返回 Container 的 Registry Index。

| 参数 | 说明 |
|---|---|
| SCENE_INDEX | 目标 Scene 的 Registry Index |
| NAME | Container 名称 |
| U | GLB 文件 URL，支持 httpURL、dataURL 和 blobURL |
