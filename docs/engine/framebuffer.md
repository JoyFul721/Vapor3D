# Framebuffer

## 创建 FBO

![创建 FBO](/blocks/vapor3D_FBO_Create.svg)

创建一个空的 Framebuffer 对象。

| 参数 | 说明 |
|---|---|
| NAME | FBO 名称，用于 Inspector 查找 |


## 绑定 FBO

![绑定 FBO](/blocks/vapor3D_FBO_Bind.svg)

将指定 FBO 绑定为当前渲染目标。

| 参数 | 说明 |
|---|---|
| Index | FBO 在 Registry 中的索引 |

::: tip 提示
Index 为 `-1` 时，将绑定默认帧缓冲区，即直接输出到 Vapor DOM 画布。
:::


## 附加 2D 纹理

![附加 2D 纹理](/blocks/vapor3D_FBO_AttachTexture.svg)

将 2D 纹理附加到指定 FBO 的附件槽位。

| 参数 | 说明 |
|---|---|
| Index | FBO 在 Registry 中的索引 |
| TEX | 纹理在 Registry 中的索引 |
| SLOT | 附件槽位 |

## 附加 Cubemap

![附加 Cubemap](/blocks/vapor3D_FBO_AttachCubeTexture.svg)

将 Cubemap 的指定面附加到 FBO。

| 参数 | 说明 |
|---|---|
| Index | FBO 在 Registry 中的索引 |
| TEX | Cubemap 在 Registry 中的索引 |
| FACE_INDEX | Cubemap 面索引 |
| SLOT | 附件槽位 |

## 解绑附件

![分离纹理](/blocks/vapor3D_FBO_Detach.svg)

从指定 FBO 中分离指定附件槽位上的附件。

| 参数 | 说明 |
|---|---|
| Index | FBO 在 Registry 中的索引 |
| SLOT | 附件槽位 |


## 创建 StencilBuffer

![创建 StencilBuffer](/blocks/vapor3D_Stencil_Create.svg)

创建指定尺寸的 StencilBuffer。

| 参数 | 说明 |
|---|---|
| NAME | 缓冲区名称，用于 Inspector 查找 |
| W | 缓冲区宽度 |
| H | 缓冲区高度 |

## 附加 StencilBuffer

![附加 StencilBuffer](/blocks/vapor3D_FBO_AttachStencil.svg)

将指定 StencilBuffer 附加到 FBO。

| 参数 | 说明 |
|---|---|
| Index | FBO 在 Registry 中的索引 |
| STENCIL_INDEX | StencilBuffer 在 Registry 中的索引 |

### 分离 StencilBuffer

![分离 StencilBuffer](/blocks/vapor3D_FBO_DetachStencil.svg)

从指定 FBO 中分离 StencilBuffer。

| 参数 | 说明 |
|---|---|
| Index | FBO 在 Registry 中的索引 |