# VAO

## 创建空 VAO

![创建空 VAO](/blocks/vapor3D_VAO_CreateEmpty.svg)

创建一个空 VAO

| 参数 | 说明 |
|---|---|
| 名称（NAME） | VAO 的名称，用于 Inspector 查找 |

## 创建屏幕四边形

![创建屏幕四边形](/blocks/vapor3D_VAO_CreateScreenQuad.svg)

生成预制全屏四边形 VAO

| 参数 | 说明 |
|---|---|
| 名称（NAME） | VAO 的名称，用于 Inspector 查找 |

## 创建立方体

![创建立方体](/blocks/vapor3D_VAO_CreateCube.svg)

生成预制立方体 VAO

| 参数 | 说明 |
|---|---|
| 名称（NAME） | VAO 的名称，用于 Inspector 查找 |

## 创建球体

![创建球体](/blocks/vapor3D_VAO_CreateSphere.svg)

生成预制球体 VAO

| 参数 | 说明 |
|---|---|
| 名称（NAME） | VAO 的名称，用于 Inspector 查找 |
| 纬度分段（LAT） | 球体纬度细分数 |
| 经度分段（LON） | 球体经度细分数 |

::: tip 提示
以上创建积木均返回 VAO 在 Registry 中的索引，可用于后续 VAO 操作。
:::

## 上传顶点缓冲

![添加 Buffer](/blocks/vapor3D_VAO_AddBuffer.svg)

从列表上传顶点数据到 VAO，并配置顶点属性。

| 参数 | 说明 |
|---|---|
| Index | VAO 在 Registry 中的索引 |
| LIST | 数据来源 |
| SIZE | 每个顶点属性包含的分量数量 |
| LOC | 顶点属性的 Location |

::: warning 注意
仅支持全局列表。
:::

## 绘制

![绘制 VAO](/blocks/vapor3D_VAO_Draw.svg)

绘制指定 VAO

| 参数 | 说明 |
|---|---|
| Index | VAO 在 Registry 中的索引 |
| COUNT | 绘制的顶点数量，`-1` 使用默认数量 |
| MODE | 绘制模式 |

## 销毁

![销毁 VAO](/blocks/vapor3D_VAO_Destroy.svg)

销毁指定 VAO

| 参数 | 说明 |
|---|---|
| Index | VAO 在 Registry 中的索引 |