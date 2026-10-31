# Core

## 初始化

![初始化](/blocks/vapor3D_gl_Init.svg)

初始化 Vapor3D 环境，并创建一个 DOM 覆盖画布，该画布位于 Scratch 原画布之上、Scratch 变量之下。
::: tip 为什么选择 DOM 覆盖？
部分 3D 扩展（如 Simpe3D）采用将 WebGL 画布内容每帧拷贝到 Scratch 画布的方式进行显示。这种方式的开销通常很大，在高分辨率下尤其明显，GPU 也容易因为与 CPU 的处理节奏不匹配而出现渲染挂起或周期性卡顿（Pipeline Stall）。

Vapor3D 选择使用独立的 DOM 画布覆盖在 Scratch 舞台上，直接显示 WebGL 渲染结果，避免不必要的开销。
:::

## 重置资源

![重置资源](/blocks/vapor3D_gl_ResetResources.svg)

销毁并清理 Registry 中所有资源。

## 更新图层

![同步画布](/blocks/vapor3D_gl_Present.svg)

使 Vapor3D 的 DOM 画布对齐 Scratch舞台。

::: warning 注意
必须在渲染循环中加入「等待 0 秒」积木进行锁帧让步，否则某些情况 GPU 会因渲染速度跟不上 CPU 绘制指令发出速度而挂起或卡死
:::


## GL States

WebGL2 基础状态控制积木。

### 清除缓冲区

![清除缓冲区](/blocks/vapor3D_gl_Clear.svg)

清除指定缓冲区，支持颜色、深度和模板缓冲区。

| 参数 | 说明 |
|---|---|
| BIT | 需要清除的缓冲区 |

### 设置清除颜色

![设置清除颜色](/blocks/vapor3D_gl_SetClearColor.svg)

设置颜色缓冲区的清除颜色。

| 参数 | 说明 |
|---|---|
| R / G / B / A | RGBA 颜色分量，范围为 0.0～1.0 |

### 启用 / 禁用状态

![启用状态](/blocks/vapor3D_ST_Enable.svg)
![禁用状态](/blocks/vapor3D_ST_Disable.svg)

启用或禁用指定的 WebGL 状态，例如深度测试、混合、面剔除和模板测试。

| 参数 | 说明 |
|---|---|
| CAP | 需要启用或禁用的状态 |

### 面剔除

![面剔除](/blocks/vapor3D_ST_CullFace.svg)

设置面剔除模式，决定绘制时剔除哪些面。

| 参数 | 说明 |
|---|---|
| MODE | FRONT、BACK 或 FRONT_AND_BACK |

### 颜色写入掩码

![颜色写入掩码](/blocks/vapor3D_ST_ColorMask.svg)

控制是否允许向颜色缓冲区写入颜色。该积木统一控制 RGBA 四个通道。

| 参数 | 说明 |
|---|---|
| STATE | 是否允许颜色写入 |

### 混合函数

![混合函数](/blocks/vapor3D_ST_BlendFuncSeparate.svg)

分别设置 RGB 和 Alpha 通道的源因子与目标因子，用于控制颜色混合方式。

| 参数 | 说明 |
|---|---|
| SRGB | RGB 源因子 |
| DRGB | RGB 目标因子 |
| SA | Alpha 源因子 |
| DA | Alpha 目标因子 |

### 深度写入掩码

![深度写入掩码](/blocks/vapor3D_ST_DepthMask.svg)

控制是否允许向深度缓冲区写入深度值。

| 参数 | 说明 |
|---|---|
| STATE | 是否允许深度写入 |

### 深度测试函数

![深度测试函数](/blocks/vapor3D_ST_DepthFunc.svg)

设置深度测试的比较函数。

| 参数 | 说明 |
|---|---|
| FUNC | 深度比较方式，如 LESS、LEQUAL、GREATER、ALWAYS 等 |

### 模板写入掩码

![模板写入掩码](/blocks/vapor3D_ST_StencilMask.svg)

设置模板缓冲区的写入掩码。

| 参数 | 说明 |
|---|---|
| MASK | 模板写入掩码 |

### 模板测试操作

![模板测试操作](/blocks/vapor3D_ST_StencilOp.svg)

设置模板测试失败、深度测试失败和深度测试通过时执行的操作。

| 参数 | 说明 |
|---|---|
| FACE | 指定应用操作的面 |
| SF | 模板测试失败时的操作 |
| DF | 模板测试通过、深度测试失败时的操作 |
| DP | 模板测试和深度测试均通过时的操作 |

### 模板测试函数

![模板测试函数](/blocks/vapor3D_ST_StencilFunc.svg)

设置模板测试的比较条件。

| 参数 | 说明 |
|---|---|
| FACE | 指定应用测试的面 |
| FUNC | 模板比较函数 |
| REF | 比较参考值 |
| MASK | 比较掩码 |
