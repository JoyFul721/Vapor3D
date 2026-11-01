# MeshNode

::: tip 提示
MeshNode 继承自 Node，故 Node 类的积木也可操控 MeshNode
:::
## 绘制网格

![绘制网格](/blocks/vapor3D_Scene_MeshDraw.svg)

绘制指定 MeshNode。绘制前会自动将当前 MeshNode 的 world matrix 上传至 uniform 变量 uModel

| 参数 | 说明 |
|---|---|
| Index | MeshNode 的 Registry Index |
| MODE | 绘制模式 |

::: tip 为什么自动上传 uModel？
如果通过 Scratch 积木手动传入 `mat4`，Vapor 需要将矩阵转换为 JSON 字符串，再通过 `JSON.parse` 解析为矩阵数据。在网格数量较多的场景中，这种重复的字符串序列化与解析会产生明显的 CPU 开销。

Vapor3D 直接从内部的 `worldMatrixBuffer` 读取并上传矩阵数据，避免不必要的字符串转换和解析开销。
:::

## 获取材质纹理

![获取材质纹理](/blocks/vapor3D_Scene_MeshGetTexture.svg)

获取 MeshNode 材质中指定类型的纹理。

| 参数 | 说明 |
|---|---|
| Index | MeshNode 的 Registry Index |
| TEX_TYPE | 纹理类型 |

::: tip
对于无材质纹理的网格，Loader 会根据材质色数值创建 1*1 的占位贴图。
:::

## 获取材质参数

![获取材质参数](/blocks/vapor3D_Scene_MeshGetParam.svg)

获取 MeshNode 材质中的指定参数。

| 参数 | 说明 |
|---|---|
| Index | MeshNode 的 Registry Index |
| PARAM | 材质参数 |

## 获取 Lightmap 参数

![获取 Lightmap 参数](/blocks/vapor3D_Scene_MeshGetLightmapParam.svg)

获取 MeshNode 的 Lightmap 指定参数。

| 参数 | 说明 |
|---|---|
| Index | MeshNode 的 Registry Index |
| PARAM | Lightmap 参数 |

## 获取 Lightmap Scale Offset 分量

![获取 Lightmap Scale Offset 分量](/blocks/vapor3D_Scene_MeshGetLightmapScaleOffsetComp.svg)

获取 MeshNode 的 Lightmap Scale Offset 指定分量。

| 参数 | 说明 |
|---|---|
| Index | MeshNode 的 Registry Index |
| COMP | 对应 Scale.x Scale.y Offset.x Offset.y |

::: tip
Unity 标准。数据来源依赖 Loader.applyLightmapMeta 注入。
:::